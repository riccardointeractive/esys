/* ─── Database Row Types ─── */

export type BlogStatus = 'draft' | 'published' | 'archived'

export interface BlogCategory {
  id: string
  slug: string
  label_es: string
  label_en: string
  label_ru: string
  description_es: string
  description_en: string
  description_ru: string
  sort_order: number
  active: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  slug: string
  category_id: string | null
  author_id: string | null

  title_es: string
  title_en: string
  title_ru: string

  excerpt_es: string
  excerpt_en: string
  excerpt_ru: string

  content_es: string
  content_en: string
  content_ru: string

  cover_image_url: string
  cover_thumb_url: string
  cover_blur_hash: string | null
  cover_alt: string
  cover_photographer_name: string
  cover_photographer_url: string
  cover_photo_page_url: string
  cover_unsplash_id: string | null

  status: BlogStatus
  featured: boolean
  published_at: string | null
  reading_minutes: number
  view_count: number

  deleted_at: string | null
  created_at: string
  updated_at: string
}

/* ─── Joined / extended ─── */

export interface BlogPostWithCategory extends BlogPost {
  category: BlogCategory | null
}

/* ─── Form Data (create / edit) ─── */

export interface BlogPostFormData {
  category_id: string | null

  title_es: string
  title_en: string
  title_ru: string

  excerpt_es: string
  excerpt_en: string
  excerpt_ru: string

  content_es: string
  content_en: string
  content_ru: string

  cover_image_url: string
  cover_thumb_url: string
  cover_blur_hash: string | null
  cover_alt: string
  cover_photographer_name: string
  cover_photographer_url: string
  cover_photo_page_url: string
  cover_unsplash_id: string | null

  status: BlogStatus
  featured: boolean
}

export interface BlogCategoryFormData {
  label_es: string
  label_en: string
  label_ru: string
  description_es: string
  description_en: string
  description_ru: string
  sort_order: number
  active: boolean
}

/* ─── Admin List Params ─── */

export interface BlogListParams {
  page: number
  limit: number
  search?: string
  status?: BlogStatus | ''
  categoryId?: string
  featured?: boolean
  sort?: 'newest' | 'oldest' | 'views'
}

/* ─── API Responses ─── */

export interface BlogPostListResponse {
  data: BlogPostWithCategory[]
  total: number
  page: number
  limit: number
}

/* ─── Unsplash (trimmed shape returned by /api/admin/unsplash/search) ─── */

export interface UnsplashPhoto {
  id: string
  url_regular: string
  url_small: string
  url_thumb: string
  blur_hash: string | null
  alt: string
  photographer_name: string
  photographer_url: string
  photo_page_url: string
}

export interface UnsplashSearchResponse {
  data: UnsplashPhoto[]
  total: number
  total_pages: number
  page: number
  cached: boolean
}
