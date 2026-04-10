import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { searchUnsplashPhotos } from '@/lib/unsplash'
import { HTTP_STATUS } from '@digiko-npm/cms/http'

/* ─── GET /api/admin/unsplash/search?q=&page= ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [], total: 0, total_pages: 0, page, cached: false })
  }

  try {
    const result = await searchUnsplashPhotos(q, page)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unsplash search failed'
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }
}
