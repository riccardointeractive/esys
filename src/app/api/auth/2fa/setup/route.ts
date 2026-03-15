import { NextRequest, NextResponse } from 'next/server'
import { generateTotpSecret, generateTotpUri, verifyTotpCode } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { verifyUserSession } from '@/lib/user-auth'

/* ─── GET /api/auth/2fa/setup — Generate TOTP secret ─── */

export async function GET(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const secret = generateTotpSecret()
  const uri = generateTotpUri(secret, session.email, AUTH_CONFIG.totpIssuer, {
    algorithm: AUTH_CONFIG.totpAlgorithm,
    digits: AUTH_CONFIG.totpDigits,
    period: AUTH_CONFIG.totpPeriod,
  })

  // Store secret temporarily (not enabled yet until user verifies)
  const supabase = getAdminClient()
  await supabase
    .from(TABLES.users)
    .update({ totp_secret: secret })
    .eq('id', session.userId)

  return NextResponse.json({
    secret,
    uri,
  })
}

/* ─── POST /api/auth/2fa/setup — Verify code and enable 2FA ─── */

export async function POST(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  let body: { totpCode: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.totpCode) {
    return NextResponse.json(
      { error: 'TOTP code is required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  // Get stored secret
  const { data: user } = await supabase
    .from(TABLES.users)
    .select('totp_secret')
    .eq('id', session.userId)
    .single()

  if (!user?.totp_secret) {
    return NextResponse.json(
      { error: 'Setup not initiated' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  // Verify code
  const valid = verifyTotpCode(body.totpCode, user.totp_secret, {
    algorithm: AUTH_CONFIG.totpAlgorithm,
    digits: AUTH_CONFIG.totpDigits,
    period: AUTH_CONFIG.totpPeriod,
  })

  if (!valid) {
    return NextResponse.json(
      { error: 'errorInvalid2fa' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  // Enable 2FA
  await supabase
    .from(TABLES.users)
    .update({ totp_enabled: true })
    .eq('id', session.userId)

  return NextResponse.json({
    success: true,
    message: 'twoFactorEnabled',
  })
}

/* ─── DELETE /api/auth/2fa/setup — Disable 2FA ─── */

export async function DELETE(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const supabase = getAdminClient()

  await supabase
    .from(TABLES.users)
    .update({
      totp_enabled: false,
      totp_secret: null,
    })
    .eq('id', session.userId)

  return NextResponse.json({
    success: true,
    message: 'twoFactorDisabled',
  })
}
