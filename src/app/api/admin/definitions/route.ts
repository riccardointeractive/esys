import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import { DEFINITION_CATEGORIES } from '@/config/property'
import type { DefinitionCategory } from '@/types/definition'

const VALID_CATEGORIES = new Set<string>(Object.values(DEFINITION_CATEGORIES))

/* ─── GET /api/admin/definitions?category=property_type ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || ''

  const supabase = getAdminClient()

  let query = supabase
    .from(TABLES.definitions)
    .select('*')
    .order('sort_order', { ascending: true })

  if (category && VALID_CATEGORIES.has(category)) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json({ data: data ?? [] })
}

/* ─── POST /api/admin/definitions ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: {
    category: DefinitionCategory
    key: string
    label_es: string
    label_en?: string
    label_ru?: string
    sort_order?: number
    active?: boolean
    metadata?: Record<string, unknown>
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.category || !VALID_CATEGORIES.has(body.category)) {
    return NextResponse.json(
      { error: 'Categoría inválida' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.key?.trim() || !body.label_es?.trim()) {
    return NextResponse.json(
      { error: 'Clave y etiqueta (ES) son obligatorios' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  // Check for duplicate key in same category
  const { data: existing } = await supabase
    .from(TABLES.definitions)
    .select('id')
    .eq('category', body.category)
    .eq('key', body.key.trim())
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe una definición con esta clave en esta categoría' },
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  // Get next sort_order if not provided
  let sortOrder = body.sort_order
  if (sortOrder === undefined) {
    const { data: lastDef } = await supabase
      .from(TABLES.definitions)
      .select('sort_order')
      .eq('category', body.category)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    sortOrder = (lastDef?.sort_order ?? -1) + 1
  }

  const { data, error } = await supabase
    .from(TABLES.definitions)
    .insert({
      category: body.category,
      key: body.key.trim(),
      label_es: body.label_es.trim(),
      label_en: body.label_en?.trim() ?? '',
      label_ru: body.label_ru?.trim() ?? '',
      sort_order: sortOrder,
      active: body.active ?? true,
      metadata: body.metadata ?? {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json(data, { status: HTTP_STATUS.CREATED })
}
