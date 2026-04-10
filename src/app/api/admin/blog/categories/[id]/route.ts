import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import type { BlogCategoryFormData } from '@/types/blog'

type RouteContext = { params: Promise<{ id: string }> }

/* ─── GET /api/admin/blog/categories/[id] ─── */

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogCategories)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Categoría no encontrada' },
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }
  return NextResponse.json(data)
}

/* ─── PUT /api/admin/blog/categories/[id] ─── */

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  let body: Partial<BlogCategoryFormData>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue
    updateData[key] = typeof value === 'string' ? value.trim() : value
  }

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogCategories)
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json(data)
}

/* ─── DELETE /api/admin/blog/categories/[id] ─── */

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = getAdminClient()

  // Block delete if there are still posts in this category
  const { count, error: countError } = await supabase
    .from(TABLES.blogPosts)
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id)
    .is('deleted_at', null)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: ${count} artículo(s) usan esta categoría` },
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  const { error } = await supabase
    .from(TABLES.blogCategories)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT })
}
