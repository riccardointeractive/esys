/**
 * Publish a blog post to ESYS VIP directly from a JSON draft.
 *
 * Mirrors /api/admin/blog/posts POST: resolves category, picks an Unsplash
 * cover from a query, sanitizes HTML with the same allow-list as the admin
 * form, calculates reading time, generates the slug, and inserts the row
 * with status='published'.
 *
 * Usage:
 *   node --env-file=.env.local scripts/publish-blog-post.mjs scripts/blog-drafts/001-comprar-extranjero.json
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   UNSPLASH_ACCESS_KEY
 *
 * Draft JSON shape:
 *   {
 *     "category_slug": "guia-de-compra",
 *     "title_es": "...", "title_en": "...", "title_ru": "...",
 *     "excerpt_es": "...", "excerpt_en": "...", "excerpt_ru": "...",
 *     "content_es": "<p>…</p>",
 *     "content_en": "<p>…</p>",
 *     "content_ru": "<p>…</p>",
 *     "unsplash_query": "notary signing spain",
 *     "featured": false     // optional, default false
 *   }
 */

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import sanitizeHtml from 'sanitize-html'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const SITE_URL = 'https://esysvip.com'

const POSTS_TABLE = 'esys_blog_posts'
const CATEGORIES_TABLE = 'esys_blog_categories'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error('✗ Missing UNSPLASH_ACCESS_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

/* ─── Helpers mirrored from src/lib ─── */

/** Mirrors src/lib/slug.ts */
function generateSlug(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Mirrors src/lib/reading-time.ts */
function calcReadingMinutes(html) {
  if (!html) return 1
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!text) return 1
  return Math.max(1, Math.ceil(text.split(' ').length / 200))
}

/** Mirrors src/lib/sanitize-html.ts */
const ALLOWED_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'u', 's',
  'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'br', 'hr',
]
function sanitizeBlogHtml(html) {
  if (!html) return ''
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading', 'decoding'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    enforceHtmlBoundary: false,
    transformTags: {
      a: (_tag, attribs) => {
        const href = (attribs.href || '').trim()
        const isExternal = /^https?:\/\//i.test(href)
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            href,
            rel: 'noopener noreferrer nofollow',
            ...(isExternal ? { target: '_blank' } : {}),
          },
        }
      },
      img: (_tag, attribs) => ({
        tagName: 'img',
        attribs: { ...attribs, loading: 'lazy', decoding: 'async' },
      }),
    },
  })
}

/* ─── Unsplash ─── */

async function pickUnsplashCover(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query,
  )}&per_page=5&page=1&content_filter=high&orientation=landscape`

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  })
  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  const first = json.results?.[0]
  if (!first) {
    throw new Error(`No Unsplash results for query: "${query}"`)
  }

  const withUtm = (u) =>
    u.includes('?') ? `${u}&utm_source=esys_vip&utm_medium=referral` : `${u}?utm_source=esys_vip&utm_medium=referral`

  return {
    cover_image_url: first.urls.regular,
    cover_thumb_url: first.urls.thumb,
    cover_blur_hash: first.blur_hash ?? null,
    cover_alt: first.alt_description || first.description || '',
    cover_photographer_name: first.user.name,
    cover_photographer_url: withUtm(first.user.links.html),
    cover_photo_page_url: withUtm(first.links.html),
    cover_unsplash_id: first.id,
  }
}

/* ─── Main ─── */

async function main() {
  const draftPath = process.argv[2]
  if (!draftPath) {
    console.error('Usage: node scripts/publish-blog-post.mjs <draft.json>')
    process.exit(1)
  }

  const absPath = resolve(process.cwd(), draftPath)
  console.log(`📄 Draft: ${absPath}`)

  const raw = await readFile(absPath, 'utf8')
  const draft = JSON.parse(raw)

  /* ─── Validate ─── */
  const required = [
    'category_slug',
    'title_es', 'title_en', 'title_ru',
    'excerpt_es', 'excerpt_en', 'excerpt_ru',
    'content_es', 'content_en', 'content_ru',
    'unsplash_query',
  ]
  const missing = required.filter((k) => !draft[k] || !String(draft[k]).trim())
  if (missing.length) {
    console.error(`✗ Missing required fields: ${missing.join(', ')}`)
    process.exit(1)
  }

  /* ─── Resolve category ─── */
  const { data: category, error: catErr } = await supabase
    .from(CATEGORIES_TABLE)
    .select('id, label_es')
    .eq('slug', draft.category_slug)
    .is('deleted_at', null)
    .maybeSingle()

  if (catErr) throw new Error(`category lookup: ${catErr.message}`)
  if (!category) {
    throw new Error(`Category "${draft.category_slug}" not found. Run seed-blog-categories.mjs first.`)
  }
  console.log(`📂 Category: ${category.label_es} (${draft.category_slug})`)

  /* ─── Pick Unsplash cover ─── */
  console.log(`🖼  Unsplash query: "${draft.unsplash_query}"`)
  const cover = await pickUnsplashCover(draft.unsplash_query)
  console.log(`   → ${cover.cover_photographer_name} — ${cover.cover_unsplash_id}`)

  /* ─── Sanitize HTML ─── */
  const sanitizedEs = sanitizeBlogHtml(draft.content_es)
  const sanitizedEn = sanitizeBlogHtml(draft.content_en)
  const sanitizedRu = sanitizeBlogHtml(draft.content_ru)
  const readingMinutes = calcReadingMinutes(sanitizedEs)

  /* ─── Unique slug ─── */
  const baseSlug = generateSlug(draft.title_es)
  const { data: existing } = await supabase
    .from(POSTS_TABLE)
    .select('id')
    .eq('slug', baseSlug)
    .is('deleted_at', null)
    .maybeSingle()
  const finalSlug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  /* ─── Insert ─── */
  const now = new Date().toISOString()
  const { data: post, error } = await supabase
    .from(POSTS_TABLE)
    .insert({
      slug: finalSlug,
      category_id: category.id,
      title_es: draft.title_es.trim(),
      title_en: draft.title_en.trim(),
      title_ru: draft.title_ru.trim(),
      excerpt_es: draft.excerpt_es.trim(),
      excerpt_en: draft.excerpt_en.trim(),
      excerpt_ru: draft.excerpt_ru.trim(),
      content_es: sanitizedEs,
      content_en: sanitizedEn,
      content_ru: sanitizedRu,
      ...cover,
      status: 'published',
      featured: draft.featured ?? false,
      published_at: now,
      reading_minutes: readingMinutes,
    })
    .select()
    .single()

  if (error) {
    console.error(`✗ Insert failed: ${error.message}`)
    if (error.details) console.error('  details:', error.details)
    process.exit(1)
  }

  console.log(`\n✅ Published: ${post.slug}`)
  console.log(`   reading_minutes: ${readingMinutes}`)
  console.log(`\n🇪🇸 ${SITE_URL}/es/blog/${post.slug}`)
  console.log(`🇬🇧 ${SITE_URL}/en/blog/${post.slug}`)
  console.log(`🇷🇺 ${SITE_URL}/ru/blog/${post.slug}`)
}

main().catch((err) => {
  console.error('Fatal:', err.message || err)
  process.exit(1)
})
