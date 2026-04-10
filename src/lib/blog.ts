import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { BlogPost, BlogPostWithCategory, BlogCategory } from '@/types/blog'

/* ─── Public blog queries (published only) ─── */

interface FetchPostsOptions {
  categoryId?: string
  featured?: boolean
  limit?: number
  page?: number
  excludeId?: string
}

interface FetchPostsResult {
  data: BlogPostWithCategory[]
  total: number
}

/** Fetch published posts (paginated) with their category joined. */
export async function fetchPublishedPosts(
  opts: FetchPostsOptions = {}
): Promise<FetchPostsResult> {
  const supabase = getAdminClient()
  const limit = opts.limit ?? 12
  const page = opts.page ?? 1
  const offset = (page - 1) * limit

  let query = supabase
    .from(TABLES.blogPosts)
    .select(`*, category:${TABLES.blogCategories}(*)`, { count: 'exact' })
    .is('deleted_at', null)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (opts.categoryId) query = query.eq('category_id', opts.categoryId)
  if (opts.featured) query = query.eq('featured', true)
  if (opts.excludeId) query = query.neq('id', opts.excludeId)

  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query
  if (error || !data) return { data: [], total: 0 }
  return { data: data as BlogPostWithCategory[], total: count ?? 0 }
}

/** Fetch a single published post by slug. */
export async function fetchPostBySlug(slug: string): Promise<BlogPostWithCategory | null> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogPosts)
    .select(`*, category:${TABLES.blogCategories}(*)`)
    .eq('slug', slug)
    .is('deleted_at', null)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !data) return null
  return data as BlogPostWithCategory
}

/** Fetch all active categories. */
export async function fetchActiveCategories(): Promise<BlogCategory[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogCategories)
    .select('*')
    .is('deleted_at', null)
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('label_es', { ascending: true })

  if (error || !data) return []
  return data as BlogCategory[]
}

/** Fetch a single active category by slug. */
export async function fetchCategoryBySlug(slug: string): Promise<BlogCategory | null> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogCategories)
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .eq('active', true)
    .maybeSingle()

  if (error || !data) return null
  return data as BlogCategory
}

/** Fetch related posts (same category, exclude current). */
export async function fetchRelatedPosts(
  categoryId: string | null,
  excludeId: string,
  limit = 3
): Promise<BlogPostWithCategory[]> {
  if (!categoryId) return []
  const result = await fetchPublishedPosts({ categoryId, excludeId, limit })
  return result.data
}

/** Count of published posts per category (for sidebar display). */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogPosts)
    .select('category_id')
    .is('deleted_at', null)
    .eq('status', 'published')

  if (error || !data) return {}
  const counts: Record<string, number> = {}
  for (const row of data as Pick<BlogPost, 'category_id'>[]) {
    if (!row.category_id) continue
    counts[row.category_id] = (counts[row.category_id] ?? 0) + 1
  }
  return counts
}
