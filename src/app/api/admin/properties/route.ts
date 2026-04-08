import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/slug'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import type { PropertyFormData } from '@/types/property'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

/* ─── GET /api/admin/properties ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT))
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const category = searchParams.get('category') || ''
  const type = searchParams.get('type') || ''
  const sort = searchParams.get('sort') || 'newest'

  const supabase = getAdminClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from(TABLES.properties)
    .select('*', { count: 'exact' })
    .is('deleted_at', null)

  if (search) {
    query = query.or(`title_es.ilike.%${search}%,title_en.ilike.%${search}%,city.ilike.%${search}%,address.ilike.%${search}%`)
  }
  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (type) query = query.eq('type', type)

  switch (sort) {
    case 'priceAsc':
      query = query.order('price', { ascending: true })
      break
    case 'priceDesc':
      query = query.order('price', { ascending: false })
      break
    case 'sizeDesc':
      query = query.order('area', { ascending: false })
      break
    case 'sizeAsc':
      query = query.order('area', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

/* ─── POST /api/admin/properties ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: PropertyFormData
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.title_es?.trim()) {
    return NextResponse.json(
      { error: 'El título (ES) es obligatorio' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = getAdminClient()
  const slug = generateSlug(body.title_es)

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from(TABLES.properties)
    .select('id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  // Insert property
  const { data: property, error: propError } = await supabase
    .from(TABLES.properties)
    .insert({
      title_es: body.title_es.trim(),
      title_en: body.title_en?.trim() ?? '',
      title_ru: body.title_ru?.trim() ?? '',
      slug: finalSlug,
      description_es: body.description_es?.trim() ?? '',
      description_en: body.description_en?.trim() ?? '',
      description_ru: body.description_ru?.trim() ?? '',
      type: body.type,
      status: body.status || 'available',
      category: body.category,
      price: body.price || 0,
      area: body.area || 0,
      bedrooms: body.bedrooms || 0,
      bathrooms: body.bathrooms || 0,
      address: body.address?.trim() ?? '',
      city: body.city?.trim() ?? '',
      province: body.province?.trim() ?? '',
      postal_code: body.postal_code?.trim() ?? '',
      latitude: body.latitude,
      longitude: body.longitude,
      energy_rating: body.energy_rating || null,
      year_built: body.year_built,
      floor: body.floor,
      featured: body.featured ?? false,
      published: body.published ?? false,
    })
    .select()
    .single()

  if (propError) {
    return NextResponse.json(
      { error: propError.message },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  // Insert features
  if (body.features?.length) {
    const featureRows = body.features.map((key) => ({
      property_id: property.id,
      feature_key: key,
    }))
    await supabase.from(TABLES.propertyFeatures).insert(featureRows)
  }

  // Insert images
  if (body.images?.length) {
    const imageRows = body.images.map((img, idx) => ({
      property_id: property.id,
      url: img.url,
      alt_text: img.alt_text || '',
      caption_es: img.caption_es || '',
      caption_en: img.caption_en || '',
      caption_ru: img.caption_ru || '',
      sort_order: img.sort_order ?? idx,
    }))
    await supabase.from(TABLES.propertyImages).insert(imageRows)
  }

  return NextResponse.json(property, { status: HTTP_STATUS.CREATED })
}
