import { NextRequest, NextResponse } from 'next/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { AUTH_CONFIG } from '@/config/auth'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { verifyUserSession, createUserSession, deleteUserSession, getSessionToken } from '@/lib/user-auth'

/* ─── PUT /api/auth/profile ─── */

export async function PUT(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  let body: { fullName?: string; username?: string; email?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const { fullName, username, email } = body

  if (!fullName && !username && !email) {
    return NextResponse.json(
      { error: 'No fields to update' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const updates: Record<string, string> = {}

  if (fullName) {
    const trimmed = fullName.trim()
    if (trimmed.length < 2) {
      return NextResponse.json(
        { error: 'errorNameTooShort' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }
    updates.full_name = trimmed
  }

  if (username) {
    const trimmed = username.trim().toLowerCase()
    if (trimmed.length < AUTH_CONFIG.minUsernameLength || trimmed.length > AUTH_CONFIG.maxUsernameLength) {
      return NextResponse.json(
        { error: 'errorUsernameLength' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }
    if (!/^[a-z0-9_]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: 'errorUsernameFormat' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }
    updates.username = trimmed
  }

  if (email) {
    const trimmed = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: 'errorEmailFormat' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }
    updates.email = trimmed
  }

  const supabase = getAdminClient()

  /* ─── Check uniqueness for username/email ─── */
  if (updates.username) {
    const { data: existing } = await supabase
      .from(TABLES.users)
      .select('id')
      .eq('username', updates.username)
      .neq('id', session.userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'errorUsernameTaken' },
        { status: HTTP_STATUS.CONFLICT }
      )
    }
  }

  if (updates.email) {
    const { data: existing } = await supabase
      .from(TABLES.users)
      .select('id')
      .eq('email', updates.email)
      .neq('id', session.userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'errorEmailTaken' },
        { status: HTTP_STATUS.CONFLICT }
      )
    }
  }

  /* ─── Update user ─── */
  const { error } = await supabase
    .from(TABLES.users)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', session.userId)

  if (error) {
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  /* ─── Refresh session with updated data ─── */
  const oldToken = getSessionToken(request)
  if (oldToken) {
    await deleteUserSession(oldToken)
  }

  const newToken = await createUserSession({
    id: session.userId,
    email: updates.email || session.email,
    username: updates.username || session.username,
    full_name: updates.full_name || session.fullName,
  })

  const response = NextResponse.json({
    success: true,
    message: 'profileUpdated',
  })

  response.cookies.set(AUTH_CONFIG.userSessionCookieName, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CONFIG.userSessionDurationMs / 1000,
  })

  return response
}
