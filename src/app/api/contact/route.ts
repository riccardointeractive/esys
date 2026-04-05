import { NextRequest, NextResponse } from 'next/server'
import { createRateLimiter } from '@digiko-npm/cms/session'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import {
  validateHoneypot,
  verifyTurnstileToken,
  HONEYPOT_FIELD_NAMES,
} from '@digiko-npm/cms/captcha'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'

/* ─── POST /api/contact ─── */

interface ContactBody {
  name?: string
  email?: string
  phone?: string
  message?: string
  locale?: string
  turnstileToken?: string
  [key: string]: unknown
}

const rateLimiter = createRateLimiter({
  redisUrl: process.env.UPSTASH_REDIS_REST_URL!,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
  keyPrefix: 'esys:contact:',
  maxAttempts: AUTH_CONFIG.contactMaxAttempts,
  windowMs: AUTH_CONFIG.contactWindowMs,
})

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  /* ─── Parse body ─── */
  let body: ContactBody
  try {
    body = (await request.json()) as ContactBody
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  /* ─── Honeypot + time-trap (cheap, runs first) ─── */
  const honeypotResult = validateHoneypot({
    honeypotValue: body[HONEYPOT_FIELD_NAMES.honeypot] as string | undefined,
    renderedAt: body[HONEYPOT_FIELD_NAMES.renderedAt] as number | string | undefined,
  })

  if (!honeypotResult.ok) {
    // Return success to bots so they don't know they were caught.
    console.warn('[contact] honeypot rejected:', honeypotResult.reason)
    return NextResponse.json({ success: true })
  }

  /* ─── Field validation ─── */
  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim().toLowerCase()
  const phone = (body.phone ?? '').trim()
  const message = (body.message ?? '').trim()
  const locale = (body.locale ?? '').trim() || null

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'errorRequiredFields' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'errorEmailFormat' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }
  if (name.length > 200 || email.length > 200 || phone.length > 50 || message.length > 5000) {
    return NextResponse.json(
      { error: 'errorTooLong' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  /* ─── Rate limit per IP ─── */
  const ip = getClientIp(request)
  const rl = await rateLimiter.check(ip)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'errorRateLimit' },
      { status: HTTP_STATUS.TOO_MANY_REQUESTS }
    )
  }

  /* ─── Cloudflare Turnstile verification ─── */
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    console.error('[contact] TURNSTILE_SECRET_KEY is not configured')
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  const turnstile = await verifyTurnstileToken({
    token: body.turnstileToken ?? '',
    secretKey,
    remoteIp: ip === 'unknown' ? undefined : ip,
  })

  if (!turnstile.success) {
    console.warn('[contact] turnstile rejected:', turnstile.errorCodes)
    return NextResponse.json(
      { error: 'errorCaptcha' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  /* ─── Persist to Supabase ─── */
  const supabase = getAdminClient()
  const { error: insertError } = await supabase
    .from(TABLES.contactMessages)
    .insert({
      name,
      email,
      phone: phone || null,
      message,
      locale,
      ip,
      user_agent: request.headers.get('user-agent') ?? null,
    })

  if (insertError) {
    console.error('[contact] insert failed:', insertError)
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json({ success: true })
}
