import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'
import { locales, defaultLocale } from '@/config/i18n'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'

/**
 * Dynamic sitemap for ESYS VIP.
 *
 * Emits every public URL across all locales with full hreflang alternates so
 * Google and Yandex can serve the right language variant per market.
 *
 * Sources:
 *   - Static routes from siteConfig / ROUTES
 *   - Published properties (esys_properties)
 *   - Published blog posts (esys_blog_posts)
 *   - Active blog categories (esys_blog_categories)
 */

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1h — sitemap is cheap but not free

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface StaticRoute {
  path: string
  changeFrequency: ChangeFreq
  priority: number
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: '',               changeFrequency: 'daily',   priority: 1.0 },
  { path: '/propiedades',   changeFrequency: 'daily',   priority: 0.9 },
  { path: '/obra-nueva',    changeFrequency: 'daily',   priority: 0.9 },
  { path: '/segunda-mano',  changeFrequency: 'daily',   priority: 0.9 },
  { path: '/blog',          changeFrequency: 'daily',   priority: 0.8 },
  { path: '/nosotros',      changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contacto',      changeFrequency: 'monthly', priority: 0.5 },
]

const BASE_URL = siteConfig.url.replace(/\/$/, '')

function urlFor(lang: string, path: string): string {
  return `${BASE_URL}/${lang}${path}`
}

function buildAlternates(path: string): MetadataRoute.Sitemap[number]['alternates'] {
  const languages: Record<string, string> = {}
  for (const lang of locales) {
    languages[lang] = urlFor(lang, path)
  }
  // x-default points to the canonical locale so search engines serve ES when
  // no user-language match exists.
  languages['x-default'] = urlFor(defaultLocale, path)
  return { languages }
}

function entryFor(
  path: string,
  lastModified: Date,
  changeFrequency: ChangeFreq,
  priority: number,
): MetadataRoute.Sitemap {
  return locales.map((lang) => ({
    url: urlFor(lang, path),
    lastModified,
    changeFrequency,
    priority,
    alternates: buildAlternates(path),
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getAdminClient()
  const now = new Date()

  /* ─── Static routes ─── */
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    entryFor(route.path, now, route.changeFrequency, route.priority),
  )

  /* ─── Published properties ─── */
  const { data: properties } = await supabase
    .from(TABLES.properties)
    .select('slug, updated_at')
    .is('deleted_at', null)
    .eq('published', true)

  const propertyEntries: MetadataRoute.Sitemap = (properties ?? [])
    .filter((p): p is { slug: string; updated_at: string | null } => Boolean(p.slug))
    .flatMap((p) =>
      entryFor(
        `/propiedades/${p.slug}`,
        p.updated_at ? new Date(p.updated_at) : now,
        'weekly',
        0.7,
      ),
    )

  /* ─── Published blog posts ─── */
  const { data: posts } = await supabase
    .from(TABLES.blogPosts)
    .select('slug, updated_at, published_at')
    .is('deleted_at', null)
    .eq('status', 'published')

  const postEntries: MetadataRoute.Sitemap = (posts ?? [])
    .filter(
      (p): p is { slug: string; updated_at: string | null; published_at: string | null } =>
        Boolean(p.slug),
    )
    .flatMap((p) => {
      const lastMod = p.updated_at ?? p.published_at
      return entryFor(
        `/blog/${p.slug}`,
        lastMod ? new Date(lastMod) : now,
        'weekly',
        0.6,
      )
    })

  /* ─── Active blog categories ─── */
  const { data: categories } = await supabase
    .from(TABLES.blogCategories)
    .select('slug, updated_at')
    .is('deleted_at', null)
    .eq('active', true)

  const categoryEntries: MetadataRoute.Sitemap = (categories ?? [])
    .filter((c): c is { slug: string; updated_at: string | null } => Boolean(c.slug))
    .flatMap((c) =>
      entryFor(
        `/blog/categoria/${c.slug}`,
        c.updated_at ? new Date(c.updated_at) : now,
        'weekly',
        0.5,
      ),
    )

  return [...staticEntries, ...propertyEntries, ...postEntries, ...categoryEntries]
}
