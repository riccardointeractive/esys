import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, hashPassword, generateSessionToken } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { verifyUserSession } from '@/lib/user-auth'

/* ─── POST /api/auth/change-password ─── */

export async function POST(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  let body: { currentPassword: string; newPassword: string; confirmPassword: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json(
      { error: 'All fields are required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: 'errorPasswordMismatch' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (newPassword.length < AUTH_CONFIG.minPasswordLength) {
    return NextResponse.json(
      { error: 'errorPasswordShort' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  /* ─── Get current password hash ─── */
  const { data: user } = await supabase
    .from(TABLES.users)
    .select('id, password_hash, password_salt')
    .eq('id', session.userId)
    .single()

  if (!user) {
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  /* ─── Verify current password ─── */
  const valid = verifyPassword(currentPassword, user.password_salt, user.password_hash, {
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

  /* ─── Hash and update new password ─── */
  const salt = generateSessionToken(16)
  const hash = hashPassword(newPassword, salt, {
    iterations: AUTH_CONFIG.pbkdf2Iterations,
    keyLength: AUTH_CONFIG.pbkdf2KeyLength,
    digest: AUTH_CONFIG.pbkdf2Digest,
  })

  await supabase
    .from(TABLES.users)
    .update({
      password_hash: hash,
      password_salt: salt,
    })
    .eq('id', session.userId)

  return NextResponse.json({
    success: true,
    message: 'newPasswordSet',
  })
}
