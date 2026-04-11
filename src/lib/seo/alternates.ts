import type { Metadata } from 'next'
import { locales, defaultLocale, type Locale } from '@/config/i18n'
import { localizedRoutes, ROUTE_SLUGS } from '@/config/i18n/routes'
import { siteConfig } from '@/config/site'
import type { BlogPost } from '@/types/blog'

/**
 * Map a blog post to its per-locale slug. ES falls back to `slug`, EN/RU
 * use their own columns and fall back to the ES slug if the localised one
 * is still empty.
 */
export function slugForLocale(
  post: Pick<BlogPost, 'slug' | 'slug_en' | 'slug_ru'>,
  locale: Locale,
): string {
  if (locale === 'en') return post.slug_en || post.slug
  if (locale === 'ru') return post.slug_ru || post.slug
  return post.slug
}

/**
 * SEO alternates / hreflang helpers.
 *
 * ESYS uses per-locale URL slugs (e.g. /es/propiedades, /en/properties,
 * /ru/nedvizhimost). Both the sitemap and every page's metadata must emit the
 * canonical URL for the current locale plus hreflang links to the sibling
 * localized URLs.
 *
 * All helpers return absolute URLs anchored at `siteConfig.url`.
 */

export const SITE_URL = siteConfig.url.replace(/\/$/, '')

/** Join the site URL with a locale-prefixed path. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** A function that returns the localized path for a given locale. */
export type LocalePathFn = (lang: Locale) => string

/**
 * Build a Next.js `alternates` field (canonical + hreflang languages) from a
 * function that produces the localized path for any locale.
 */
export function buildAlternates(
  currentLang: Locale,
  pathFor: LocalePathFn,
): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {}
  for (const lang of locales) {
    languages[lang] = absoluteUrl(pathFor(lang))
  }
  // x-default points to the canonical (Spanish) variant.
  languages['x-default'] = absoluteUrl(pathFor(defaultLocale))

  return {
    canonical: absoluteUrl(pathFor(currentLang)),
    languages,
  }
}

/**
 * Pre-built hreflang helpers for each logical public route.
 *
 * Usage in a page's `generateMetadata`:
 *
 *   return {
 *     title: ...,
 *     alternates: hreflang.blog(locale),
 *   }
 */
export const hreflang = {
  home: (lang: Locale) =>
    buildAlternates(lang, (l) => `/${l}`),

  properties: (lang: Locale) =>
    buildAlternates(lang, (l) => localizedRoutes(l).properties),

  propertyDetail: (lang: Locale, slug: string) =>
    buildAlternates(lang, (l) => localizedRoutes(l).propertyDetail(slug)),

  newBuilds: (lang: Locale) =>
    buildAlternates(lang, (l) => localizedRoutes(l).newBuilds),

  resale: (lang: Locale) =>
    buildAlternates(lang, (l) => localizedRoutes(l).resale),

  about: (lang: Locale) =>
    buildAlternates(lang, (l) => localizedRoutes(l).about),

  contact: (lang: Locale) =>
    buildAlternates(lang, (l) => localizedRoutes(l).contact),

  blog: (lang: Locale) =>
    buildAlternates(lang, (l) => localizedRoutes(l).blog),

  /**
   * Per-locale blog post URL. `post` must carry all three slug columns so
   * each hreflang entry points to its own localised URL.
   */
  blogPost: (
    lang: Locale,
    post: Pick<BlogPost, 'slug' | 'slug_en' | 'slug_ru'>,
  ) =>
    buildAlternates(lang, (l) => localizedRoutes(l).blogPost(slugForLocale(post, l))),

  blogCategory: (lang: Locale, slug: string) =>
    buildAlternates(lang, (l) => localizedRoutes(l).blogCategory(slug)),

  blogCategoryIndex: (lang: Locale) =>
    buildAlternates(
      lang,
      (l) => `/${l}/${ROUTE_SLUGS[l].blog}/${ROUTE_SLUGS[l].blogCategory}`,
    ),
}
