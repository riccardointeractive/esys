import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { siteConfig } from '@/config/site'
import { absoluteUrl, slugForLocale } from '@/lib/seo/alternates'
import type { BlogPostWithCategory } from '@/types/blog'
import type { PropertyWithRelations } from '@/types/property'

/**
 * JSON-LD structured data builders for ESYS VIP.
 *
 * All builders return plain `Record<string, unknown>` — serialize with
 * `<JsonLd data={...} />` (src/components/seo/JsonLd.tsx).
 *
 * Reference: https://schema.org + Google structured-data guidelines.
 */

type JsonLd = Record<string, unknown>

/* ─── Shared nodes ─── */

const ORGANIZATION: JsonLd = {
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
}

function pickLocalized<T extends Record<string, unknown>>(
  obj: T,
  key: string,
  locale: Locale,
): string {
  return (obj[`${key}_${locale}`] as string) || (obj[`${key}_es`] as string) || ''
}

/* ─── BreadcrumbList ─── */

export interface BreadcrumbItem {
  name: string
  /** Absolute URL. Use `absoluteUrl(path)` from alternates.ts. */
  url: string
}

export function breadcrumbListJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

/* ─── Article (blog post) ─── */

export function articleJsonLd(
  post: BlogPostWithCategory,
  locale: Locale,
): JsonLd {
  const routes = localizedRoutes(locale)
  const canonical = absoluteUrl(routes.blogPost(slugForLocale(post, locale)))

  const headline = pickLocalized(post as unknown as Record<string, unknown>, 'title', locale)
  const description = pickLocalized(post as unknown as Record<string, unknown>, 'excerpt', locale)

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    inLanguage: locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    author: ORGANIZATION,
    publisher: ORGANIZATION,
  }

  if (post.cover_image_url) {
    data.image = post.cover_image_url
  }
  if (post.published_at) {
    data.datePublished = post.published_at
  }
  if (post.updated_at) {
    data.dateModified = post.updated_at
  }
  // reading_minutes is stored on the post; approximate word count @ 200 wpm
  if (post.reading_minutes && post.reading_minutes > 0) {
    data.wordCount = post.reading_minutes * 200
  }

  return data
}

/* ─── Residence (property detail) ─── */

/**
 * Map ESYS property.type → schema.org accommodation subtype.
 * Falls back to Residence for unknown / generic types.
 */
function residenceTypeFor(propertyType: string): string {
  switch (propertyType.toLowerCase()) {
    case 'apartment':
    case 'flat':
    case 'studio':
    case 'penthouse':
    case 'atico':
      return 'Apartment'
    case 'house':
    case 'villa':
    case 'chalet':
    case 'bungalow':
    case 'townhouse':
    case 'adosado':
      return 'SingleFamilyResidence'
    default:
      return 'Residence'
  }
}

export function residenceJsonLd(
  property: PropertyWithRelations,
  locale: Locale,
): JsonLd {
  const routes = localizedRoutes(locale)
  const canonical = absoluteUrl(routes.propertyDetail(property.slug))

  const name = pickLocalized(property as unknown as Record<string, unknown>, 'title', locale)
  const description = pickLocalized(
    property as unknown as Record<string, unknown>,
    'description',
    locale,
  )

  const images = (property.images ?? []).map((img) => img.url).filter(Boolean)

  const address: JsonLd = { '@type': 'PostalAddress', addressCountry: 'ES' }
  if (property.address) address.streetAddress = property.address
  if (property.city) address.addressLocality = property.city
  if (property.province) address.addressRegion = property.province
  if (property.postal_code) address.postalCode = property.postal_code

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': residenceTypeFor(property.type),
    name,
    description,
    url: canonical,
    address,
  }

  if (images.length > 0) data.image = images
  if (property.area && property.area > 0) {
    data.floorSize = {
      '@type': 'QuantitativeValue',
      value: property.area,
      unitCode: 'MTK', // square metres
    }
  }
  if (property.bedrooms && property.bedrooms > 0) {
    data.numberOfBedrooms = property.bedrooms
  }
  if (property.bathrooms && property.bathrooms > 0) {
    data.numberOfBathroomsTotal = property.bathrooms
  }
  if (property.year_built) {
    data.yearBuilt = property.year_built
  }
  if (property.latitude != null && property.longitude != null) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    }
  }

  // Offer (price, availability)
  if (property.price && property.price > 0) {
    data.offers = {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: siteConfig.defaultCurrency,
      availability:
        property.status === 'sold'
          ? 'https://schema.org/SoldOut'
          : property.status === 'reserved'
            ? 'https://schema.org/LimitedAvailability'
            : 'https://schema.org/InStock',
      url: canonical,
      seller: ORGANIZATION,
    }
  }

  return data
}
