import { NextRequest, NextResponse } from 'next/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/admin-auth'

/* ─── GET /api/admin/users — List registered users ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')
  const limit = parseInt(url.searchParams.get('limit') || '20')
  const search = url.searchParams.get('search') || ''

  const offset = (page - 1) * limit
  const supabase = getAdminClient()

  let query = supabase
    .from(TABLES.users)
    .select(
      'id, email, username, full_name, totp_enabled, email_verified, last_login_at, created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(
      `email.ilike.%${search}%,username.ilike.%${search}%,full_name.ilike.%${search}%`
    )
  }

  const { data: users, count, error } = await query

  if (error) {
    return NextResponse.json(
      { error: 'Error fetching users' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json({
    users: users || [],
    total: count || 0,
    page,
    limit,
  })
}

/* ─── PATCH /api/admin/users — Admin actions on a user ─── */

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: { userId: string; action: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const { userId, action } = body

  if (!userId || !action) {
    return NextResponse.json(
      { error: 'userId and action are required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  if (action === 'disable2fa') {
    const { error } = await supabase
      .from(TABLES.users)
      .update({ totp_enabled: false, totp_secret: null })
      .eq('id', userId)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: HTTP_STATUS.INTERNAL_ERROR }
      )
    }

    return NextResponse.json({ success: true, message: '2FA disabled' })
  }

  return NextResponse.json(
    { error: 'Unknown action' },
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}
