import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/slug'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import type { BlogCategoryFormData } from '@/types/blog'

/* ─── GET /api/admin/blog/categories ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from(TABLES.blogCategories)
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('label_es', { ascending: true })

    if (error) {
      console.error('[blog/categories GET] failed:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: HTTP_STATUS.INTERNAL_ERROR }
      )
    }
    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[blog/categories GET] unhandled:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `unhandled: ${message}` },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}

/* ─── POST /api/admin/blog/categories ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    let body: BlogCategoryFormData
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Cuerpo de la petición inválido' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    if (!body.label_es?.trim()) {
      return NextResponse.json(
        { error: 'La etiqueta (ES) es obligatoria' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const supabase = getAdminClient()
    const baseSlug = generateSlug(body.label_es)

    const { data: existing } = await supabase
      .from(TABLES.blogCategories)
      .select('id')
      .eq('slug', baseSlug)
      .is('deleted_at', null)
      .maybeSingle()

    const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

    const { data, error } = await supabase
      .from(TABLES.blogCategories)
      .insert({
        slug: finalSlug,
        label_es: body.label_es.trim(),
        label_en: body.label_en?.trim() ?? '',
        label_ru: body.label_ru?.trim() ?? '',
        description_es: body.description_es?.trim() ?? '',
        description_en: body.description_en?.trim() ?? '',
        description_ru: body.description_ru?.trim() ?? '',
        sort_order: body.sort_order ?? 0,
        active: body.active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('[blog/categories POST] insert failed:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: HTTP_STATUS.INTERNAL_ERROR }
      )
    }

    return NextResponse.json(data, { status: HTTP_STATUS.CREATED })
  } catch (err) {
    console.error('[blog/categories POST] unhandled:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `unhandled: ${message}` },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
