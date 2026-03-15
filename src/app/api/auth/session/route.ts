import { NextRequest, NextResponse } from 'next/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { verifyUserSession } from '@/lib/user-auth'

/* ─── GET /api/auth/session ─── */

export async function GET(request: NextRequest) {
  const session = await verifyUserSession(request)

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      email: session.email,
      username: session.username,
      fullName: session.fullName,
    },
  })
}
