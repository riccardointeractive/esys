import { Redis } from '@upstash/redis'
import type { UnsplashPhoto } from '@/types/blog'

const UNSPLASH_API = 'https://api.unsplash.com'
const CACHE_TTL_SECONDS = 60 * 15 // 15 minutes
const PER_PAGE = 24
const UTM_SUFFIX = '?utm_source=esys_vip&utm_medium=referral'

interface UnsplashApiPhoto {
  id: string
  alt_description: string | null
  description: string | null
  blur_hash: string | null
  urls: {
    regular: string
    small: string
    thumb: string
  }
  links: {
    html: string
  }
  user: {
    name: string
    links: {
      html: string
    }
  }
}

interface UnsplashApiSearchResponse {
  total: number
  total_pages: number
  results: UnsplashApiPhoto[]
}

interface CachedResult {
  data: UnsplashPhoto[]
  total: number
  total_pages: number
}

let redisClient: Redis | null = null
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!redisClient) redisClient = new Redis({ url, token })
  return redisClient
}

function buildCacheKey(query: string, page: number): string {
  const slug = query.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return `esys:unsplash:${slug}:${page}`
}

function withUtm(url: string): string {
  if (!url) return ''
  return url.includes('?') ? `${url}&utm_source=esys_vip&utm_medium=referral` : `${url}${UTM_SUFFIX}`
}

function trimPhoto(p: UnsplashApiPhoto): UnsplashPhoto {
  return {
    id: p.id,
    url_regular: p.urls.regular,
    url_small: p.urls.small,
    url_thumb: p.urls.thumb,
    blur_hash: p.blur_hash,
    alt: p.alt_description || p.description || '',
    photographer_name: p.user.name,
    photographer_url: withUtm(p.user.links.html),
    photo_page_url: withUtm(p.links.html),
  }
}

export interface SearchUnsplashResult {
  data: UnsplashPhoto[]
  total: number
  total_pages: number
  page: number
  cached: boolean
}

/**
 * Search Unsplash photos. Caches results in Redis (15 min TTL).
 * Returns trimmed photo objects suitable for storage and rendering.
 * Throws on missing access key or upstream error.
 */
export async function searchUnsplashPhotos(
  query: string,
  page = 1
): Promise<SearchUnsplashResult> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    throw new Error('UNSPLASH_ACCESS_KEY is not configured')
  }

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return { data: [], total: 0, total_pages: 0, page, cached: false }
  }

  const redis = getRedis()
  const cacheKey = buildCacheKey(trimmedQuery, page)

  if (redis) {
    const cached = await redis.get<CachedResult>(cacheKey)
    if (cached) {
      return { ...cached, page, cached: true }
    }
  }

  const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(
    trimmedQuery
  )}&per_page=${PER_PAGE}&page=${page}&content_filter=high&orientation=landscape`

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      'Accept-Version': 'v1',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as UnsplashApiSearchResponse
  const trimmed: CachedResult = {
    data: json.results.map(trimPhoto),
    total: json.total,
    total_pages: json.total_pages,
  }

  if (redis) {
    await redis.set(cacheKey, trimmed, { ex: CACHE_TTL_SECONDS })
  }

  return { ...trimmed, page, cached: false }
}
