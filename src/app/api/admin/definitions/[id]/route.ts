import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'

/* ─── PUT /api/admin/definitions/[id] ─── */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await params

  let body: {
    key?: string
    label_es?: string
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

  const supabase = getAdminClient()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.key !== undefined) updates.key = body.key.trim()
  if (body.label_es !== undefined) updates.label_es = body.label_es.trim()
  if (body.label_en !== undefined) updates.label_en = body.label_en.trim()
  if (body.label_ru !== undefined) updates.label_ru = body.label_ru.trim()
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order
  if (body.active !== undefined) updates.active = body.active
  if (body.metadata !== undefined) updates.metadata = body.metadata

  const { data, error } = await supabase
    .from(TABLES.definitions)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Definición no encontrada' },
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }

  return NextResponse.json(data)
}

/* ─── DELETE /api/admin/definitions/[id] ─── */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await params
  const supabase = getAdminClient()

  // Fetch the definition to check its category and key
  const { data: def } = await supabase
    .from(TABLES.definitions)
    .select('category, key')
    .eq('id', id)
    .single()

  if (!def) {
    return NextResponse.json(
      { error: 'Definición no encontrada' },
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }

  // Check if any properties reference this definition
  const refCheck = await checkPropertyReferences(supabase, def.category, def.key)
  if (refCheck > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: ${refCheck} propiedad(es) usan esta definición. Desactívala en su lugar.` },
      { status: HTTP_STATUS.CONFLICT }
    )
  }

  const { error } = await supabase
    .from(TABLES.definitions)
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json({ success: true })
}

/* ─── Check if properties reference a definition key ─── */

async function checkPropertyReferences(
  supabase: ReturnType<typeof getAdminClient>,
  category: string,
  key: string
): Promise<number> {
  // Map category to the property column or relation it affects
  switch (category) {
    case 'property_type': {
      const { count } = await supabase
        .from(TABLES.properties)
        .select('id', { count: 'exact', head: true })
        .eq('type', key)
        .is('deleted_at', null)
      return count ?? 0
    }
    case 'property_status': {
      const { count } = await supabase
        .from(TABLES.properties)
        .select('id', { count: 'exact', head: true })
        .eq('status', key)
        .is('deleted_at', null)
      return count ?? 0
    }
    case 'property_category': {
      const { count } = await supabase
        .from(TABLES.properties)
        .select('id', { count: 'exact', head: true })
        .eq('category', key)
        .is('deleted_at', null)
      return count ?? 0
    }
    case 'property_feature': {
      const { count } = await supabase
        .from(TABLES.propertyFeatures)
        .select('id', { count: 'exact', head: true })
        .eq('feature_key', key)
      return count ?? 0
    }
    case 'energy_rating': {
      const { count } = await supabase
        .from(TABLES.properties)
        .select('id', { count: 'exact', head: true })
        .eq('energy_rating', key)
        .is('deleted_at', null)
      return count ?? 0
    }
    default:
      return 0
  }
}
