/**
 * Swap the Unsplash cover of an existing blog post.
 *
 * Fetches the first photo matching the new query, overwrites all cover_*
 * fields in esys_blog_posts, keeps everything else (title, content, slug,
 * published_at) untouched.
 *
 * Usage:
 *   node --env-file=.env.local scripts/update-blog-cover.mjs <slug> "<query>"
 *
 * Example:
 *   node --env-file=.env.local scripts/update-blog-cover.mjs \
 *     nie-para-extranjeros-que-es-como-solicitarlo-y-por-que-lo-necesitas \
 *     "official document signature"
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   UNSPLASH_ACCESS_KEY
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !UNSPLASH_ACCESS_KEY) {
  console.error('✗ Missing env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / UNSPLASH_ACCESS_KEY)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const TABLE = 'esys_blog_posts'

async function pickCover(query) {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
    query,
  )}&per_page=5&page=1&content_filter=high&orientation=landscape`

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  })
  if (!res.ok) throw new Error(`Unsplash API: ${res.status} ${res.statusText}`)
  const json = await res.json()
  const first = json.results?.[0]
  if (!first) throw new Error(`No Unsplash results for "${query}"`)

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

async function main() {
  const slug = process.argv[2]
  const query = process.argv[3]
  if (!slug || !query) {
    console.error('Usage: node --env-file=.env.local scripts/update-blog-cover.mjs <slug> "<query>"')
    process.exit(1)
  }

  const { data: post, error } = await supabase
    .from(TABLE)
    .select('id, slug, cover_photographer_name, cover_unsplash_id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()
  if (error || !post) {
    console.error(`✗ Post not found: ${error?.message || 'no row'}`)
    process.exit(1)
  }

  console.log(`📄 Post: ${post.slug}`)
  console.log(`   Old cover: ${post.cover_photographer_name} (${post.cover_unsplash_id})`)
  console.log(`🖼  New query: "${query}"`)

  const cover = await pickCover(query)
  console.log(`   New cover: ${cover.cover_photographer_name} (${cover.cover_unsplash_id})`)
  console.log(`   Alt: ${cover.cover_alt || '(none)'}`)

  const { error: updErr } = await supabase
    .from(TABLE)
    .update(cover)
    .eq('id', post.id)

  if (updErr) {
    console.error(`✗ Update failed: ${updErr.message}`)
    process.exit(1)
  }

  console.log('\n✅ Cover swapped.')
  console.log(`   https://esysvip.com/es/blog/${post.slug}`)
}

main().catch((e) => { console.error('Fatal:', e.message); process.exit(1) })
