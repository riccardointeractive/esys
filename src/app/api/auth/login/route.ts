import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, verifyTotpCode } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { createUserSession } from '@/lib/user-auth'
import type { UserWithCredentials } from '@/types/user'

/* ─── POST /api/auth/login ─── */

export async function POST(request: NextRequest) {
  let body: { email: string; password: string; totpCode?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const { email, password, totpCode } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  /* ─── Find user ─── */
  const { data: user } = await supabase
    .from(TABLES.users)
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (!user) {
    return NextResponse.json(
      { error: 'errorInvalidCredentials' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const dbUser = user as UserWithCredentials

  /* ─── Verify password ─── */
  const valid = verifyPassword(password, dbUser.password_salt, dbUser.password_hash, {
    iterations: AUTH_CONFIG.pbkdf2Iterations,
    keyLength: AUTH_CONFIG.pbkdf2KeyLength,
    digest: AUTH_CONFIG.pbkdf2Digest,
  })

  if (!valid) {
    return NextResponse.json(
      { error: 'errorInvalidCredentials' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  /* ─── 2FA check ─── */
  if (dbUser.totp_enabled && dbUser.totp_secret) {
    if (!totpCode) {
      return NextResponse.json({
        success: false,
        requires2fa: true,
      })
    }

    const totpValid = verifyTotpCode(totpCode, dbUser.totp_secret, {
      algorithm: AUTH_CONFIG.totpAlgorithm,
      digits: AUTH_CONFIG.totpDigits,
      period: AUTH_CONFIG.totpPeriod,
    })

    if (!totpValid) {
      return NextResponse.json(
        { error: 'errorInvalid2fa' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }
  }

  /* ─── Update last login ─── */
  await supabase
    .from(TABLES.users)
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', dbUser.id)

  /* ─── Create session ─── */
  const token = await createUserSession(dbUser)

  const response = NextResponse.json({
    success: true,
    user: {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
      full_name: dbUser.full_name,
      totp_enabled: dbUser.totp_enabled,
      email_verified: dbUser.email_verified,
      created_at: dbUser.created_at,
      updated_at: dbUser.updated_at,
    },
  })

  response.cookies.set(AUTH_CONFIG.userSessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CONFIG.userSessionDurationMs / 1000,
  })

  return response
}
