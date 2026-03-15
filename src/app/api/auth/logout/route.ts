import { NextRequest, NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/config/auth'
import { deleteUserSession, getSessionToken } from '@/lib/user-auth'

/* ─── POST /api/auth/logout ─── */

export async function POST(request: NextRequest) {
  const token = getSessionToken(request)

  if (token) {
    await deleteUserSession(token)
  }

  const response = NextResponse.json({ success: true })

  response.cookies.set(AUTH_CONFIG.userSessionCookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
