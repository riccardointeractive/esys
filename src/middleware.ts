import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale, isValidLocale } from '@/config/i18n'
import { EN_TO_INTERNAL } from '@/config/i18n/routes'
import { AUTH_CONFIG } from '@/config/auth'

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

  /* Root → redirect to default locale */
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  /* Extract locale from first segment */
  const segments = pathname.split('/')
  const maybeLocale = segments[1]

  /* No valid locale prefix → redirect to default */
  if (!isValidLocale(maybeLocale)) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url))
  }

  /* EN route rewrite: /en/properties → /en/propiedades (internal file) */
  if (maybeLocale === 'en') {
    const secondSegment = segments[2]
    if (secondSegment && secondSegment in EN_TO_INTERNAL) {
      const internalSlug = EN_TO_INTERNAL[secondSegment]
      const rest = segments.slice(3).join('/')
      const rewritePath = `/en/${internalSlug}${rest ? `/${rest}` : ''}`
      return NextResponse.rewrite(new URL(rewritePath, request.url))
    }

    /* Also handle nested account routes: /en/account/favorites → /en/cuenta/favoritos */
    if (secondSegment === 'account') {
      const thirdSegment = segments[3]
      const accountRest = thirdSegment && thirdSegment in EN_TO_INTERNAL
        ? EN_TO_INTERNAL[thirdSegment]
        : thirdSegment
      const rewritePath = `/en/cuenta${accountRest ? `/${accountRest}` : ''}`
      return NextResponse.rewrite(new URL(rewritePath, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
