import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import type { PropertyFormData } from '@/types/property'

type RouteContext = { params: Promise<{ id: string }> }

/* ─── GET /api/admin/properties/[id] ─── */

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = getAdminClient()

  const { data: property, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !property) {
    return NextResponse.json(
      { error: 'Propiedad no encontrada' },
      { status: HTTP_STATUS.NOT_FOUND }
    )
  }

  // Fetch related images and features
  const [imagesRes, featuresRes] = await Promise.all([
    supabase
      .from(TABLES.propertyImages)
      .select('*')
      .eq('property_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from(TABLES.propertyFeatures)
      .select('*')
      .eq('property_id', id),
  ])

  return NextResponse.json({
    ...property,
    images: imagesRes.data ?? [],
    features: featuresRes.data ?? [],
  })
}

/* ─── PUT /api/admin/properties/[id] ─── */

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  let body: Partial<PropertyFormData>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  // Update property fields (exclude relations)
  const { features, images, ...propertyFields } = body

  // Clean string fields
  const updateData: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(propertyFields)) {
    if (value !== undefined) {
      updateData[key] = typeof value === 'string' ? value.trim() : value
    }
  }

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from(TABLES.properties)
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: HTTP_STATUS.INTERNAL_ERROR }
      )
    }
  }

  // Sync features: delete all, re-insert
  if (features !== undefined) {
    await supabase
      .from(TABLES.propertyFeatures)
      .delete()
      .eq('property_id', id)

    if (features.length > 0) {
      const featureRows = features.map((key) => ({
        property_id: id,
        feature_key: key,
      }))
      await supabase.from(TABLES.propertyFeatures).insert(featureRows)
    }
  }

  // Sync images: delete all, re-insert
  if (images !== undefined) {
    await supabase
      .from(TABLES.propertyImages)
      .delete()
      .eq('property_id', id)

    if (images.length > 0) {
      const imageRows = images.map((img, idx) => ({
        property_id: id,
        url: img.url,
        alt_text: img.alt_text || '',
        sort_order: img.sort_order ?? idx,
      }))
      await supabase.from(TABLES.propertyImages).insert(imageRows)
    }
  }

  // Return updated property
  const { data: updated } = await supabase
    .from(TABLES.properties)
    .select('*')
    .eq('id', id)
    .single()

  return NextResponse.json(updated)
}

/* ─── DELETE /api/admin/properties/[id] ─── */

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = getAdminClient()

  const { error } = await supabase
    .from(TABLES.properties)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT })
}
