import { NextRequest, NextResponse } from 'next/server'
import { verifyTotpCode } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'

/* ─── POST /api/auth/2fa/verify — Verify TOTP during login ─── */

export async function POST(request: NextRequest) {
  let body: { email: string; totpCode: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.email || !body.totpCode) {
    return NextResponse.json(
      { error: 'Email and TOTP code are required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  const { data: user } = await supabase
    .from(TABLES.users)
    .select('totp_secret, totp_enabled')
    .eq('email', body.email.toLowerCase())
    .single()

  if (!user?.totp_secret || !user.totp_enabled) {
    return NextResponse.json(
      { error: 'errorInvalid2fa' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const valid = verifyTotpCode(body.totpCode, user.totp_secret, {
    algorithm: AUTH_CONFIG.totpAlgorithm,
    digits: AUTH_CONFIG.totpDigits,
    period: AUTH_CONFIG.totpPeriod,
  })

  if (!valid) {
    return NextResponse.json(
      { error: 'errorInvalid2fa' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  return NextResponse.json({ success: true })
}
