import type { MetadataRoute } from 'next'
import { locales, defaultLocale, type Locale } from '@/config/i18n'
import { localizedRoutes, ROUTE_SLUGS } from '@/config/i18n/routes'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import { absoluteUrl, slugForLocale, type LocalePathFn } from '@/lib/seo/alternates'

/**
 * Dynamic sitemap for ESYS VIP.
 *
 * Emits every public URL across all locales with full hreflang alternates so
 * Google and Yandex can serve the right language variant per market.
 *
 * ESYS uses per-locale URL slugs (e.g. /es/propiedades, /en/properties,
 * /ru/nedvizhimost). Paths are resolved via `localizedRoutes(lang)` so the
 * sitemap matches the URLs that middleware serves — never the internal
 * filesystem paths.
 *
 * Sources:
 *   - Static routes (home, properties, new-builds, resale, blog, about, contact)
 *   - Published properties (esys_properties)
 *   - Published blog posts (esys_blog_posts)
 *   - Active blog categories (esys_blog_categories)
 */

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1h

type ChangeFreq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface StaticRoute {
  pathFor: LocalePathFn
  changeFrequency: ChangeFreq
  priority: number
}

const STATIC_ROUTES: StaticRoute[] = [
  { pathFor: (l) => `/${l}`,                        changeFrequency: 'daily',   priority: 1.0 },
  { pathFor: (l) => localizedRoutes(l).properties,  changeFrequency: 'daily',   priority: 0.9 },
  { pathFor: (l) => localizedRoutes(l).newBuilds,   changeFrequency: 'daily',   priority: 0.9 },
  { pathFor: (l) => localizedRoutes(l).resale,      changeFrequency: 'daily',   priority: 0.9 },
  { pathFor: (l) => localizedRoutes(l).blog,        changeFrequency: 'daily',   priority: 0.8 },
  { pathFor: (l) => localizedRoutes(l).about,       changeFrequency: 'monthly', priority: 0.5 },
  { pathFor: (l) => localizedRoutes(l).contact,     changeFrequency: 'monthly', priority: 0.5 },
  {
    pathFor: (l) => `/${l}/${ROUTE_SLUGS[l].blog}/${ROUTE_SLUGS[l].blogCategory}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  },
]

function alternatesFor(pathFor: LocalePathFn): MetadataRoute.Sitemap[number]['alternates'] {
  const languages: Record<string, string> = {}
  for (const lang of locales) {
    languages[lang] = absoluteUrl(pathFor(lang))
  }
  languages['x-default'] = absoluteUrl(pathFor(defaultLocale))
  return { languages }
}

function entriesFor(
  pathFor: LocalePathFn,
  lastModified: Date,
  changeFrequency: ChangeFreq,
  priority: number,
): MetadataRoute.Sitemap {
  const alternates = alternatesFor(pathFor)
  return locales.map((lang) => ({
    url: absoluteUrl(pathFor(lang)),
    lastModified,
    changeFrequency,
    priority,
    alternates,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getAdminClient()
  const now = new Date()

  /* ─── Static routes ─── */
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((route) =>
    entriesFor(route.pathFor, now, route.changeFrequency, route.priority),
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
      entriesFor(
        (l: Locale) => localizedRoutes(l).propertyDetail(p.slug),
        p.updated_at ? new Date(p.updated_at) : now,
        'weekly',
        0.7,
      ),
    )

  /* ─── Published blog posts (per-locale slugs) ─── */
  const { data: posts } = await supabase
    .from(TABLES.blogPosts)
    .select('slug, slug_en, slug_ru, updated_at, published_at')
    .is('deleted_at', null)
    .eq('status', 'published')

  type PostRow = {
    slug: string
    slug_en: string
    slug_ru: string
    updated_at: string | null
    published_at: string | null
  }

  const postEntries: MetadataRoute.Sitemap = (posts ?? [])
    .filter((p): p is PostRow => Boolean(p.slug))
    .flatMap((p) => {
      const lastMod = p.updated_at ?? p.published_at
      return entriesFor(
        (l: Locale) => localizedRoutes(l).blogPost(slugForLocale(p, l)),
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
      entriesFor(
        (l: Locale) => localizedRoutes(l).blogCategory(c.slug),
        c.updated_at ? new Date(c.updated_at) : now,
        'weekly',
        0.5,
      ),
    )

  return [...staticEntries, ...propertyEntries, ...postEntries, ...categoryEntries]
}
