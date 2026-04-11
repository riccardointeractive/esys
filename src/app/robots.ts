import type { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

/**
 * robots.txt for ESYS VIP.
 *
 * Allows all public content, blocks private areas (admin, account, auth APIs)
 * and paginated/filter variants that would dilute ranking signal. Declares the
 * canonical sitemap so Google, Bing and Yandex discover every locale variant.
 */

const BASE_URL = siteConfig.url.replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/cuenta',
          '/cuenta/',
          '/api/',
          '/login',
          '/registro',
          '/reset-password',
          '/favoritos',
          '/buscar',
          // Paginated + filtered variants → canonical handled elsewhere, keep
          // them out of the index to avoid keyword dilution.
          '/*?page=*',
          '/*?utm_*',
          '/*?ref=*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
