import { NextRequest, NextResponse } from 'next/server'
import { generateSessionToken, hashPassword } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/client'
import { resetPasswordEmail } from '@/lib/email/templates'

/* ─── POST /api/auth/reset-password ─── */

export async function POST(request: NextRequest) {
  let body: {
    email?: string
    token?: string
    newPassword?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  /* ─── Step 1: Request reset (email only) ─── */
  if (body.email && !body.token) {
    const resetToken = generateSessionToken(32)
    const expiresAt = new Date(Date.now() + AUTH_CONFIG.resetTokenExpiryMs).toISOString()

    // Update user with reset token (even if user doesn't exist, return success for security)
    await supabase
      .from(TABLES.users)
      .update({
        reset_token: resetToken,
        reset_token_expires_at: expiresAt,
      })
      .eq('email', body.email.toLowerCase())

    // Send reset email (check if user actually exists to avoid leaking info)
    const { data: existingUser } = await supabase
      .from(TABLES.users)
      .select('id')
      .eq('email', body.email.toLowerCase())
      .single()

    if (existingUser) {
      const { subject, html } = resetPasswordEmail(resetToken)
      await sendEmail({ to: body.email.toLowerCase(), subject, html })
    }

    return NextResponse.json({
      success: true,
      message: 'resetSuccess',
    })
  }

  /* ─── Step 2: Confirm reset (token + newPassword) ─── */
  if (body.token && body.newPassword) {
    if (body.newPassword.length < AUTH_CONFIG.minPasswordLength) {
      return NextResponse.json(
        { error: 'errorPasswordShort' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Find user with valid reset token
    const { data: user } = await supabase
      .from(TABLES.users)
      .select('id, reset_token_expires_at')
      .eq('reset_token', body.token)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'errorInvalidToken' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Check expiry
    if (
      user.reset_token_expires_at &&
      new Date(user.reset_token_expires_at) < new Date()
    ) {
      return NextResponse.json(
        { error: 'errorInvalidToken' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // Hash new password
    const salt = generateSessionToken(16)
    const hash = hashPassword(body.newPassword, salt, {
      iterations: AUTH_CONFIG.pbkdf2Iterations,
      keyLength: AUTH_CONFIG.pbkdf2KeyLength,
      digest: AUTH_CONFIG.pbkdf2Digest,
    })

    // Update password and clear reset token
    await supabase
      .from(TABLES.users)
      .update({
        password_hash: hash,
        password_salt: salt,
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      message: 'newPasswordSet',
    })
  }

  return NextResponse.json(
    { error: 'Invalid request' },
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}
