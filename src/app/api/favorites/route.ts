import { NextRequest, NextResponse } from 'next/server'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import { getAdminClient } from '@/lib/supabase/server'
import { verifyUserSession } from '@/lib/user-auth'

/* ─── GET /api/favorites — List user's favorites ─── */

export async function GET(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const supabase = getAdminClient()

  const { data: favorites, error } = await supabase
    .from(TABLES.favorites)
    .select(`
      id,
      property_id,
      created_at,
      ${TABLES.properties} (
        id, title, slug, price, area, bedrooms, bathrooms,
        status, category, city, province
      )
    `)
    .eq('user_id', session.userId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  // Get first image for each property
  const propertyIds = (favorites || []).map((f) => f.property_id)
  let images: Record<string, string> = {}

  if (propertyIds.length > 0) {
    const { data: imgData } = await supabase
      .from(TABLES.propertyImages)
      .select('property_id, url')
      .in('property_id', propertyIds)
      .eq('sort_order', 0)

    if (imgData) {
      images = Object.fromEntries(imgData.map((img) => [img.property_id, img.url]))
    }
  }

  return NextResponse.json({
    favorites: (favorites || []).map((f) => ({
      ...f,
      image: images[f.property_id] || null,
    })),
  })
}

/* ─── POST /api/favorites — Toggle favorite ─── */

export async function POST(request: NextRequest) {
  const session = await verifyUserSession(request)
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  let body: { propertyId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.propertyId) {
    return NextResponse.json(
      { error: 'Property ID is required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()

  // Check if already favorited
  const { data: existing } = await supabase
    .from(TABLES.favorites)
    .select('id')
    .eq('user_id', session.userId)
    .eq('property_id', body.propertyId)
    .single()

  if (existing) {
    // Remove favorite
    await supabase
      .from(TABLES.favorites)
      .delete()
      .eq('id', existing.id)

    return NextResponse.json({ favorited: false })
  }

  // Add favorite
  const { error } = await supabase
    .from(TABLES.favorites)
    .insert({
      user_id: session.userId,
      property_id: body.propertyId,
    })

  if (error) {
    return NextResponse.json(
      { error: 'errorGeneric' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json({ favorited: true })
}
