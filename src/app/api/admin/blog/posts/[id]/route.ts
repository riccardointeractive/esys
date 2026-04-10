import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { sanitizeBlogHtml } from '@/lib/sanitize-html'
import { calcReadingMinutes } from '@/lib/reading-time'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import type { BlogPostFormData } from '@/types/blog'

type RouteContext = { params: Promise<{ id: string }> }

const CONTENT_FIELDS: readonly string[] = ['content_es', 'content_en', 'content_ru']

/* ─── GET /api/admin/blog/posts/[id] ─── */

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = getAdminClient()

  const { data, error } = await supabase
    .from(TABLES.blogPosts)
    .select(`*, category:${TABLES.blogCategories}(*)`)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Artículo no encontrado' },
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }

  return NextResponse.json(data)
}

/* ─── PUT /api/admin/blog/posts/[id] ─── */

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  let body: Partial<BlogPostFormData>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  // Load current row to know previous status (for published_at transition)
  const { data: current, error: loadError } = await supabase
    .from(TABLES.blogPosts)
    .select('status, published_at')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (loadError || !current) {
    return NextResponse.json(
      { error: 'Artículo no encontrado' },
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }

  // Build update payload
  const updateData: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue
    if (CONTENT_FIELDS.includes(key)) {
      updateData[key] = sanitizeBlogHtml(String(value ?? ''))
    } else if (typeof value === 'string') {
      updateData[key] = value.trim()
    } else {
      updateData[key] = value
    }
  }

  // Recalc reading_minutes if content_es changed
  if ('content_es' in updateData) {
    updateData.reading_minutes = calcReadingMinutes(updateData.content_es as string)
  }

  // Handle published_at transition
  if (body.status !== undefined && body.status !== current.status) {
    if (body.status === 'published' && !current.published_at) {
      updateData.published_at = new Date().toISOString()
    }
    if (body.status === 'draft' || body.status === 'archived') {
      // keep published_at intact (history); only set on first publish
    }
  }

  const { error } = await supabase
    .from(TABLES.blogPosts)
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  const { data: updated } = await supabase
    .from(TABLES.blogPosts)
    .select(`*, category:${TABLES.blogCategories}(*)`)
    .eq('id', id)
    .single()

  return NextResponse.json(updated)
}

/* ─── DELETE /api/admin/blog/posts/[id] ─── */

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = getAdminClient()

  const { error } = await supabase
    .from(TABLES.blogPosts)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT })
}
