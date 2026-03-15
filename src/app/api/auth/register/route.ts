import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateSessionToken } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { createUserSession } from '@/lib/user-auth'
import { sendEmail } from '@/lib/email/client'
import { welcomeEmail } from '@/lib/email/templates'
import type { User } from '@/types/user'

/* ─── POST /api/auth/register ─── */

export async function POST(request: NextRequest) {
  let body: {
    email: string
    username: string
    fullName: string
    password: string
    confirmPassword: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const { email, username, fullName, password, confirmPassword } = body

  /* ─── Validation ─── */
  if (!email || !username || !fullName || !password || !confirmPassword) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: 'errorPasswordMismatch' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (password.length < AUTH_CONFIG.minPasswordLength) {
    return NextResponse.json(
      { error: 'errorPasswordShort' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (
    username.length < AUTH_CONFIG.minUsernameLength ||
    username.length > AUTH_CONFIG.maxUsernameLength
  ) {
    return NextResponse.json(
      { error: 'errorUsernameShort' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json(
      { error: 'errorUsernameInvalid' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  /* ─── Check email uniqueness ─── */
  const { data: existingEmail } = await supabase
    .from(TABLES.users)
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existingEmail) {
    return NextResponse.json(
      { error: 'errorEmailExists' },
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  /* ─── Check username uniqueness ─── */
  const { data: existingUsername } = await supabase
    .from(TABLES.users)
    .select('id')
    .eq('username', username.toLowerCase())
    .single()

  if (existingUsername) {
    return NextResponse.json(
      { error: 'errorUsernameExists' },
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  /* ─── Hash password ─── */
  const salt = generateSessionToken(16)
  const hash = hashPassword(password, salt, {
    iterations: AUTH_CONFIG.pbkdf2Iterations,
    keyLength: AUTH_CONFIG.pbkdf2KeyLength,
    digest: AUTH_CONFIG.pbkdf2Digest,
  })

  /* ─── Insert user ─── */
  const { data: newUser, error: insertError } = await supabase
    .from(TABLES.users)
    .insert({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      full_name: fullName.trim(),
      password_hash: hash,
      password_salt: salt,
    })
    .select('id, email, username, full_name, totp_enabled, email_verified, created_at, updated_at')
    .single()

  if (insertError || !newUser) {
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  /* ─── Send welcome email ─── */
  const welcome = welcomeEmail(fullName.trim())
  sendEmail({ to: email.toLowerCase(), subject: welcome.subject, html: welcome.html })
    .catch(() => {}) // fire-and-forget

  /* ─── Create session ─── */
  const token = await createUserSession(newUser as User)

  const response = NextResponse.json({
    success: true,
    user: newUser,
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
