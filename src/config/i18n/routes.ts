import type { Locale } from './index'

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
} as const

/* ─── Reverse Map: EN slug → internal (ES) slug for middleware rewrite ─── */

export const EN_TO_INTERNAL: Record<string, string> = {
  'properties': 'propiedades',
  'new-builds': 'obra-nueva',
  'resale': 'segunda-mano',
  'about': 'nosotros',
  'contact': 'contacto',
  'register': 'registro',
  'account': 'cuenta',
  'favorites': 'favoritos',
  'searches': 'busquedas',
  'alerts': 'alertas',
  'settings': 'ajustes',
}

/* ─── Internal (ES) slug → EN slug for LanguageSwitcher ─── */

export const INTERNAL_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(EN_TO_INTERNAL).map(([en, es]) => [es, en])
)

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

  if (toLang === 'es') {
    // EN → ES: replace EN slugs with ES
    let result = withoutLang
    for (const [enSlug, esSlug] of Object.entries(EN_TO_INTERNAL)) {
      result = result.replace(`/${enSlug}`, `/${esSlug}`)
    }
    return `/es${result === '/' ? '' : result}`
  }

  // ES → EN: replace ES slugs with EN
  let result = withoutLang
  for (const [esSlug, enSlug] of Object.entries(INTERNAL_TO_EN)) {
    result = result.replace(`/${esSlug}`, `/${enSlug}`)
  }
  return `/en${result === '/' ? '' : result}`
}
