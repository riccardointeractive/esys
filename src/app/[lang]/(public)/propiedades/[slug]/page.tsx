import { notFound } from 'next/navigation'
import { Bed, Bath, Maximize, MapPin, Building2, Calendar, Layers, Zap } from 'lucide-react'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { fetchPropertyBySlug } from '@/lib/properties'
import { cn } from '@/lib/utils'

interface PropertyDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { lang, slug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const routes = localizedRoutes(locale)

  const property = await fetchPropertyBySlug(slug)
  if (!property) notFound()

  const title = property[`title_${locale}`] || property.title_es
  const description = property[`description_${locale}`] || property.description_es
  const location = [property.city, property.province].filter(Boolean).join(', ')
  const fullAddress = [property.address, property.city, property.province, property.postal_code]
    .filter(Boolean)
    .join(', ')

  const formattedPrice = new Intl.NumberFormat(locale === 'es' ? 'es-ES' : 'en-GB', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(property.price)

  const mainImage = property.images[0]
  const typeLabel = dict.property.types[property.type as keyof typeof dict.property.types] ?? property.type
  const statusLabel = dict.property.status[property.status as keyof typeof dict.property.status] ?? property.status
  const categoryLabel = dict.property.category[property.category as keyof typeof dict.property.category] ?? property.category

  return (
    <div className="ds-container ds-py-8">
      <nav className="ds-breadcrumb ds-mb-6">
        <span className="ds-breadcrumb__item">
          <a href={routes.properties} className="ds-breadcrumb__link">{dict.nav.properties}</a>
        </span>
        <span className="ds-breadcrumb__item">
          <span className="ds-breadcrumb__current">{title}</span>
        </span>
      </nav>

      <div className="ds-grid ds-grid-cols-1 ds-lg:grid-cols-3 ds-gap-8">
        {/* Main content */}
        <div className="ds-lg:col-span-2 ds-flex ds-flex-col ds-gap-6">
          {/* Gallery */}
          <div className="ds-card">
            {mainImage && (
              <div className="ds-card__media">
                <img
                  src={mainImage.url}
                  alt={mainImage.alt_text || title}
                  style={{ width: '100%', height: 400, objectFit: 'cover' }}
                />
              </div>
            )}
            {property.images.length > 1 && (
              <div className="ds-flex ds-gap-2 ds-p-3">
                {property.images.slice(0, 4).map((img, i) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.alt_text || `${title} ${i + 1}`}
                    className="ds-rounded-md"
                    style={{ width: '25%', height: 80, objectFit: 'cover', opacity: i === 0 ? 1 : 0.7 }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title + badges + stats */}
          <div className="ds-card">
            <div className="ds-card__body">
              <div className="ds-flex ds-justify-between ds-items-start ds-gap-4">
                <div>
                  <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
                    {title}
                  </h1>
                  {location && (
                    <p className="ds-text-secondary ds-mt-1 ds-flex ds-items-center ds-gap-1">
                      <MapPin size={14} /> {location}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'ds-badge',
                    property.status === 'available' && 'ds-badge--success',
                    property.status === 'reserved' && 'ds-badge--warning',
                    property.status === 'sold' && 'ds-badge--error'
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="ds-flex ds-gap-2 ds-mt-3">
                <span className="ds-badge ds-badge--outline">{categoryLabel}</span>
                <span className="ds-badge ds-badge--outline">{typeLabel}</span>
              </div>

              <div className="ds-flex ds-gap-6 ds-text-sm ds-text-tertiary ds-mt-4">
                <span className="ds-flex ds-items-center ds-gap-1">
                  <Bed size={16} /> {property.bedrooms}
                </span>
                <span className="ds-flex ds-items-center ds-gap-1">
                  <Bath size={16} /> {property.bathrooms}
                </span>
                <span className="ds-flex ds-items-center ds-gap-1">
                  <Maximize size={16} /> {property.area} m&sup2;
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="ds-card">
              <div className="ds-card__body">
                <p className="ds-text-secondary ds-whitespace-pre-line">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* Details table */}
          <div className="ds-card">
            <div className="ds-card__body">
              <h2 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                {dict.property.detail.detailsTitle}
              </h2>
              <dl className="ds-grid ds-grid-cols-2 ds-gap-y-3 ds-gap-x-6 ds-text-sm">
                {fullAddress && (
                  <>
                    <dt className="ds-text-tertiary ds-flex ds-items-center ds-gap-1">
                      <MapPin size={14} /> {dict.property.detail.address}
                    </dt>
                    <dd className="ds-text-primary">{fullAddress}</dd>
                  </>
                )}
                <dt className="ds-text-tertiary ds-flex ds-items-center ds-gap-1">
                  <Building2 size={14} /> {dict.property.detail.type}
                </dt>
                <dd className="ds-text-primary">{typeLabel}</dd>
                {property.floor != null && (
                  <>
                    <dt className="ds-text-tertiary ds-flex ds-items-center ds-gap-1">
                      <Layers size={14} /> {dict.property.detail.floor}
                    </dt>
                    <dd className="ds-text-primary">{property.floor}</dd>
                  </>
                )}
                {property.year_built != null && (
                  <>
                    <dt className="ds-text-tertiary ds-flex ds-items-center ds-gap-1">
                      <Calendar size={14} /> {dict.property.detail.yearBuilt}
                    </dt>
                    <dd className="ds-text-primary">{property.year_built}</dd>
                  </>
                )}
                {property.energy_rating && (
                  <>
                    <dt className="ds-text-tertiary ds-flex ds-items-center ds-gap-1">
                      <Zap size={14} /> {dict.property.detail.energyRating}
                    </dt>
                    <dd className="ds-text-primary">{property.energy_rating}</dd>
                  </>
                )}
              </dl>
            </div>
          </div>

          {/* Features */}
          {property.features.length > 0 && (
            <div className="ds-card">
              <div className="ds-card__body">
                <h2 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                  {dict.property.detail.featuresTitle}
                </h2>
                <div className="ds-flex ds-flex-wrap ds-gap-2">
                  {property.features.map((f) => {
                    const label = dict.property.features[f.feature_key as keyof typeof dict.property.features] ?? f.feature_key
                    return (
                      <span key={f.id} className="ds-badge ds-badge--outline">
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div className="ds-card" style={{ position: 'sticky', top: 'var(--ds-space-6, 1.5rem)' }}>
            <div className="ds-card__body">
              <p className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-2">
                {formattedPrice}
              </p>
              <p className="ds-text-xs ds-text-tertiary ds-mb-4">
                {dict.property.detail.ref} {property.id.slice(0, 8).toUpperCase()}
              </p>
              <button className="ds-btn ds-btn--full ds-btn--lg ds-mb-3">
                {dict.property.contactBtn}
              </button>
              <button className="ds-btn ds-btn--full ds-btn--lg ds-btn--outline">
                {dict.property.saveBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
