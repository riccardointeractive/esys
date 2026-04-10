import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { generateSlug } from '@/lib/slug'
import { sanitizeBlogHtml } from '@/lib/sanitize-html'
import { calcReadingMinutes } from '@/lib/reading-time'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import type { BlogPostFormData } from '@/types/blog'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

/* ─── GET /api/admin/blog/posts ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE)
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT))
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const featured = searchParams.get('featured') || ''
  const sort = searchParams.get('sort') || 'newest'

  const supabase = getAdminClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from(TABLES.blogPosts)
    .select(`*, category:${TABLES.blogCategories}(*)`, { count: 'exact' })
    .is('deleted_at', null)

  if (search) {
    query = query.or(
      `title_es.ilike.%${search}%,title_en.ilike.%${search}%,title_ru.ilike.%${search}%,slug.ilike.%${search}%`
    )
  }
  if (status) query = query.eq('status', status)
  if (categoryId) query = query.eq('category_id', categoryId)
  if (featured === 'true') query = query.eq('featured', true)

  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'views':
      query = query.order('view_count', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    page,
    limit,
  })
}

/* ─── POST /api/admin/blog/posts ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: BlogPostFormData
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
  const baseSlug = generateSlug(body.title_es)

  const { data: existing } = await supabase
    .from(TABLES.blogPosts)
    .select('id')
    .eq('slug', baseSlug)
    .is('deleted_at', null)
    .maybeSingle()

  const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const sanitizedEs = sanitizeBlogHtml(body.content_es ?? '')
  const sanitizedEn = sanitizeBlogHtml(body.content_en ?? '')
  const sanitizedRu = sanitizeBlogHtml(body.content_ru ?? '')

  const readingMinutes = calcReadingMinutes(sanitizedEs)
  const isPublished = body.status === 'published'

  const { data: post, error } = await supabase
    .from(TABLES.blogPosts)
    .insert({
      slug: finalSlug,
      category_id: body.category_id || null,
      title_es: body.title_es.trim(),
      title_en: body.title_en?.trim() ?? '',
      title_ru: body.title_ru?.trim() ?? '',
      excerpt_es: body.excerpt_es?.trim() ?? '',
      excerpt_en: body.excerpt_en?.trim() ?? '',
      excerpt_ru: body.excerpt_ru?.trim() ?? '',
      content_es: sanitizedEs,
      content_en: sanitizedEn,
      content_ru: sanitizedRu,
      cover_image_url: body.cover_image_url ?? '',
      cover_thumb_url: body.cover_thumb_url ?? '',
      cover_blur_hash: body.cover_blur_hash || null,
      cover_alt: body.cover_alt ?? '',
      cover_photographer_name: body.cover_photographer_name ?? '',
      cover_photographer_url: body.cover_photographer_url ?? '',
      cover_photo_page_url: body.cover_photo_page_url ?? '',
      cover_unsplash_id: body.cover_unsplash_id || null,
      status: body.status || 'draft',
      featured: body.featured ?? false,
      published_at: isPublished ? new Date().toISOString() : null,
      reading_minutes: readingMinutes,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json(post, { status: HTTP_STATUS.CREATED })
}
