import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale, isValidLocale, type Locale } from '@/config/i18n'
import { SLUG_TO_INTERNAL } from '@/config/i18n/routes'
import { AUTH_CONFIG } from '@/config/auth'

/** Fallback for detection when no Accept-Language match is found */
const DETECTION_FALLBACK: Locale = 'en'

/** Parse Accept-Language header and return the best matching locale */
function detectLocale(request: NextRequest): Locale {
  const header = request.headers.get('accept-language')
  if (!header) return DETECTION_FALLBACK

  const preferred = header
    .split(',')
    .map((part) => {
      const [lang, q] = part.trim().split(';q=')
      return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of preferred) {
    const prefix = lang.split('-')[0]
    const match = locales.find((l) => l === prefix)
    if (match) return match
  }

  return DETECTION_FALLBACK
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /* ─── Admin auth guard ─── */
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionCookie = request.cookies.get(AUTH_CONFIG.sessionCookieName)
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  /* Skip static files, api, admin */
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  /* Root → redirect to browser-preferred locale */
  if (pathname === '/') {
    const detected = detectLocale(request)
    return NextResponse.redirect(new URL(`/${detected}`, request.url))
  }

  /* Extract locale from first segment */
  const segments = pathname.split('/')

  /* ─── User account guard ─── */
  const accountSlugs = ['cuenta', 'account', 'kabinet']
  const pathSecondSegment = segments[2]
  if (pathSecondSegment && accountSlugs.includes(pathSecondSegment)) {
    const userSessionCookie = request.cookies.get(AUTH_CONFIG.userSessionCookieName)
    if (!userSessionCookie?.value) {
      const lang = segments[1] || 'es'
      return NextResponse.redirect(new URL(`/${lang}/login`, request.url))
    }
  }
  const maybeLocale = segments[1]

  /* No valid locale prefix → redirect to detected locale */
  if (!isValidLocale(maybeLocale)) {
    const detected = detectLocale(request)
    return NextResponse.redirect(new URL(`/${detected}${pathname}`, request.url))
  }

  /* Non-default locale route rewrite: /en/properties → /en/propiedades (internal file) */
  if (maybeLocale !== defaultLocale) {
    const slugMap = SLUG_TO_INTERNAL[maybeLocale]
    if (!slugMap) return NextResponse.next()

    const secondSegment = segments[2]

    /* Handle account nested routes: /{lang}/account/favorites → /{lang}/cuenta/favoritos */
    const accountSlug = Object.entries(slugMap).find(([, internal]) => internal === 'cuenta')?.[0]
    if (accountSlug && secondSegment === accountSlug) {
      const thirdSegment = segments[3]
      const rewritedThird = thirdSegment && thirdSegment in slugMap
        ? slugMap[thirdSegment]
        : thirdSegment
      const rewritePath = `/${maybeLocale}/cuenta${rewritedThird ? `/${rewritedThird}` : ''}`
      return NextResponse.rewrite(new URL(rewritePath, request.url))
    }

    /* Standard route rewrite */
    if (secondSegment && secondSegment in slugMap) {
      const internalSlug = slugMap[secondSegment]
      const rest = segments.slice(3).join('/')
      const rewritePath = `/${maybeLocale}/${internalSlug}${rest ? `/${rest}` : ''}`
      return NextResponse.rewrite(new URL(rewritePath, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
