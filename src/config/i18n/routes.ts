import type { Locale } from './index'
import { defaultLocale, locales } from './index'

/* ─── URL Slug Mapping per Locale ─── */

export const ROUTE_SLUGS = {
  es: {
    properties: 'propiedades',
    newBuilds: 'obra-nueva',
    resale: 'segunda-mano',
    about: 'nosotros',
    contact: 'contacto',
    login: 'login',
    register: 'registro',
    account: 'cuenta',
    favorites: 'favoritos',
    searches: 'busquedas',
    alerts: 'alertas',
    settings: 'ajustes',
  },
  en: {
    properties: 'properties',
    newBuilds: 'new-builds',
    resale: 'resale',
    about: 'about',
    contact: 'contact',
    login: 'login',
    register: 'register',
    account: 'account',
    favorites: 'favorites',
    searches: 'searches',
    alerts: 'alerts',
    settings: 'settings',
  },
  ru: {
    properties: 'nedvizhimost',
    newBuilds: 'novostrojki',
    resale: 'vtorichnoe',
    about: 'o-nas',
    contact: 'kontakty',
    login: 'login',
    register: 'registratsiya',
    account: 'kabinet',
    favorites: 'izbrannoe',
    searches: 'poiski',
    alerts: 'uvedomleniya',
    settings: 'nastrojki',
  },
} as const

type RouteKey = keyof typeof ROUTE_SLUGS.es

/* ─── Reverse maps: locale slug → internal (ES) slug for middleware rewrite ─── */

function buildSlugToInternal(lang: Locale): Record<string, string> {
  const source = ROUTE_SLUGS[lang]
  const internal = ROUTE_SLUGS[defaultLocale]
  const map: Record<string, string> = {}
  for (const key of Object.keys(source) as RouteKey[]) {
    if (source[key] !== internal[key]) {
      map[source[key]] = internal[key]
    }
  }
  return map
}

function buildInternalToSlug(lang: Locale): Record<string, string> {
  const toInternal = buildSlugToInternal(lang)
  return Object.fromEntries(
    Object.entries(toInternal).map(([localized, internal]) => [internal, localized])
  )
}

/** Maps from locale slug → internal (ES) slug, per non-default locale */
export const SLUG_TO_INTERNAL: Partial<Record<Locale, Record<string, string>>> = Object.fromEntries(
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => [l, buildSlugToInternal(l)])
)

/** Maps from internal (ES) slug → locale slug, per non-default locale */
export const INTERNAL_TO_SLUG: Partial<Record<Locale, Record<string, string>>> = Object.fromEntries(
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => [l, buildInternalToSlug(l)])
)

/* ─── Backward compat exports ─── */
export const EN_TO_INTERNAL = SLUG_TO_INTERNAL.en ?? {}
export const INTERNAL_TO_EN = INTERNAL_TO_SLUG.en ?? {}

/* ─── Generate localized route paths ─── */

export function localizedRoutes(lang: Locale) {
  const s = ROUTE_SLUGS[lang]
  return {
    home: `/${lang}`,
    properties: `/${lang}/${s.properties}`,
    propertyDetail: (slug: string) => `/${lang}/${s.properties}/${slug}`,
    newBuilds: `/${lang}/${s.newBuilds}`,
    resale: `/${lang}/${s.resale}`,
    about: `/${lang}/${s.about}`,
    contact: `/${lang}/${s.contact}`,
    login: `/${lang}/${s.login}`,
    register: `/${lang}/${s.register}`,
    favorites: `/${lang}/${s.favorites}`,
    account: `/${lang}/${s.account}`,
    accountFavorites: `/${lang}/${s.account}/${s.favorites}`,
    accountSearches: `/${lang}/${s.account}/${s.searches}`,
    accountAlerts: `/${lang}/${s.account}/${s.alerts}`,
    accountSettings: `/${lang}/${s.account}/${s.settings}`,
  } as const
}

/* ─── Translate current pathname to target locale ─── */

export function translatePathname(pathname: string, fromLang: Locale, toLang: Locale): string {
  // Remove current lang prefix
  const withoutLang = pathname.replace(`/${fromLang}`, '') || '/'

  if (fromLang === toLang) return pathname

  // Step 1: Convert fromLang slugs → internal (ES) slugs
  let internal = withoutLang
  if (fromLang !== defaultLocale) {
    const toInternalMap = SLUG_TO_INTERNAL[fromLang] ?? {}
    for (const [localized, internalSlug] of Object.entries(toInternalMap)) {
      internal = internal.replace(`/${localized}`, `/${internalSlug}`)
    }
  }

  // Step 2: Convert internal (ES) slugs → toLang slugs
  let result = internal
  if (toLang !== defaultLocale) {
    const fromInternalMap = INTERNAL_TO_SLUG[toLang] ?? {}
    for (const [internalSlug, localized] of Object.entries(fromInternalMap)) {
      result = result.replace(`/${internalSlug}`, `/${localized}`)
    }
  }

  return `/${toLang}${result === '/' ? '' : result}`
}
