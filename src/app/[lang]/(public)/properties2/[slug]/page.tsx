import { notFound } from 'next/navigation'
import {
  Bed, Bath, Maximize, MapPin, Building2, Calendar, Layers, Zap,
  Heart, Share2, Printer, Phone, MessageCircle, ChevronRight,
  Sparkles, Check,
} from 'lucide-react'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { fetchPropertyBySlug, fetchProperties } from '@/lib/properties'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/routes'
import { PropertyGallery2 } from '@/components/property/PropertyGallery2'
import { EnergyRatingBadge } from '@/components/property/EnergyRatingBadge'
import { MortgageCalculator } from '@/components/property/MortgageCalculator'
import { StickyMobileBar } from '@/components/property/StickyMobileBar'

interface PropertyDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export default async function PropertyDetail2Page({ params }: PropertyDetailPageProps) {
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

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat(locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n)

  const formattedPrice = fmtPrice(property.price)
  const pricePerM2 = property.area > 0 ? fmtPrice(Math.round(property.price / property.area)) : null

  const typeLabel = dict.property.types[property.type as keyof typeof dict.property.types] ?? property.type
  const statusLabel = dict.property.status[property.status as keyof typeof dict.property.status] ?? property.status
  const categoryLabel = dict.property.category[property.category as keyof typeof dict.property.category] ?? property.category
  const refCode = property.id.slice(0, 8).toUpperCase()

  // Fetch similar properties (same city, same category, exclude current)
  const similar = await fetchProperties({ category: property.category as 'newBuild' | 'resale', limit: 4 })
  const similarFiltered = similar.filter((p) => p.id !== property.id).slice(0, 3)

  // Build highlights from features (pick first 3 notable ones)
  const highlights = property.features.slice(0, 3).map((f) => {
    const label = dict.property.features[f.feature_key as keyof typeof dict.property.features] ?? f.feature_key
    return label
  })

  // Characteristics data
  const characteristics = [
    { icon: Building2, label: dict.property.detail.type, value: typeLabel },
    { icon: Bed, label: 'Dormitorios', value: String(property.bedrooms) },
    { icon: Bath, label: 'Baños', value: String(property.bathrooms) },
    { icon: Maximize, label: 'Superficie', value: `${property.area} m²` },
    property.floor != null ? { icon: Layers, label: dict.property.detail.floor, value: String(property.floor) } : null,
    property.year_built != null ? { icon: Calendar, label: dict.property.detail.yearBuilt, value: String(property.year_built) } : null,
  ].filter(Boolean) as { icon: typeof Building2; label: string; value: string }[]

  return (
    <>
      <div className="ds-container ds-py-6">
        {/* ── Breadcrumbs ── */}
        <nav className="ds-breadcrumb ds-mb-4">
          <span className="ds-breadcrumb__item">
            <a href={`/${locale}`} className="ds-breadcrumb__link">{dict.nav.home}</a>
          </span>
          <span className="ds-breadcrumb__item">
            <a href={routes.properties} className="ds-breadcrumb__link">{dict.nav.properties}</a>
          </span>
          {property.city && (
            <span className="ds-breadcrumb__item">
              <span className="ds-breadcrumb__link">{property.city}</span>
            </span>
          )}
          <span className="ds-breadcrumb__item">
            <span className="ds-breadcrumb__current">{title}</span>
          </span>
        </nav>

        {/* ── Gallery (full-width mosaic) ── */}
        {property.images.length > 0 && (
          <PropertyGallery2 images={property.images} title={title} />
        )}

        {/* ── Action bar: share / save / print ── */}
        <div className="vip-detail2__actions ds-mt-4 ds-mb-6">
          <button type="button" className="vip-detail2__action-btn" aria-label="Guardar">
            <Heart size={18} />
            <span>{dict.property.saveBtn}</span>
          </button>
          <button type="button" className="vip-detail2__action-btn" aria-label="Compartir">
            <Share2 size={18} />
            <span>Compartir</span>
          </button>
          <button type="button" className="vip-detail2__action-btn" aria-label="Imprimir">
            <Printer size={18} />
            <span>Imprimir</span>
          </button>
        </div>

        {/* ── Main content + Sidebar ── */}
        <div className="vip-detail2__layout">
          {/* LEFT: Main content */}
          <div className="vip-detail2__main">

            {/* ── Price bar + key stats ── */}
            <div className="ds-card">
              <div className="ds-card__body">
                <div className="ds-flex ds-justify-between ds-items-start ds-gap-4 ds-flex-wrap">
                  <div>
                    <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
                      {formattedPrice}
                    </h1>
                    {pricePerM2 && (
                      <p className="ds-text-sm ds-text-tertiary ds-mt-0-5">
                        {pricePerM2}/m²
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

                <h2 className="ds-text-lg ds-font-semibold ds-text-primary ds-mt-3">
                  {title}
                </h2>
                {location && (
                  <p className="ds-text-secondary ds-mt-1 ds-flex ds-items-center ds-gap-1">
                    <MapPin size={14} /> {location}
                  </p>
                )}

                {/* Key stats row */}
                <div className="vip-detail2__stats ds-mt-4">
                  <div className="vip-detail2__stat">
                    <Bed size={20} />
                    <div>
                      <span className="vip-detail2__stat-value">{property.bedrooms}</span>
                      <span className="vip-detail2__stat-label">Dormitorios</span>
                    </div>
                  </div>
                  <div className="vip-detail2__stat">
                    <Bath size={20} />
                    <div>
                      <span className="vip-detail2__stat-value">{property.bathrooms}</span>
                      <span className="vip-detail2__stat-label">Baños</span>
                    </div>
                  </div>
                  <div className="vip-detail2__stat">
                    <Maximize size={20} />
                    <div>
                      <span className="vip-detail2__stat-value">{property.area}</span>
                      <span className="vip-detail2__stat-label">m²</span>
                    </div>
                  </div>
                  {property.floor != null && (
                    <div className="vip-detail2__stat">
                      <Layers size={20} />
                      <div>
                        <span className="vip-detail2__stat-value">{property.floor}ª</span>
                        <span className="vip-detail2__stat-label">Planta</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category + type badges */}
                <div className="ds-flex ds-gap-2 ds-mt-4">
                  <span className="ds-badge ds-badge--outline">{categoryLabel}</span>
                  <span className="ds-badge ds-badge--outline">{typeLabel}</span>
                  <span className="ds-badge ds-badge--outline ds-text-tertiary">
                    Ref. {refCode}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Highlights ("Lo más destacado") ── */}
            {highlights.length > 0 && (
              <div className="ds-card ds-mt-6">
                <div className="ds-card__body">
                  <h3 className="ds-flex ds-items-center ds-gap-2 ds-text-base ds-font-semibold ds-text-primary ds-mb-3">
                    <Sparkles size={18} />
                    Lo más destacado
                  </h3>
                  <div className="ds-flex ds-flex-wrap ds-gap-2">
                    {highlights.map((h, i) => (
                      <span key={i} className="vip-detail2__highlight">
                        <Check size={14} />
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Description ── */}
            {description && (
              <div className="ds-card ds-mt-6">
                <div className="ds-card__body">
                  <h3 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-3">
                    {dict.property.description}
                  </h3>
                  <p className="ds-text-secondary ds-whitespace-pre-line" style={{ lineHeight: '1.7' }}>
                    {description}
                  </p>
                </div>
              </div>
            )}

            {/* ── Characteristics (structured table) ── */}
            <div className="ds-card ds-mt-6">
              <div className="ds-card__body">
                <h3 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                  {dict.property.detail.detailsTitle}
                </h3>
                <div className="vip-detail2__chars">
                  {fullAddress && (
                    <div className="vip-detail2__char-row">
                      <dt className="vip-detail2__char-label">
                        <MapPin size={16} /> {dict.property.detail.address}
                      </dt>
                      <dd className="vip-detail2__char-value">{fullAddress}</dd>
                    </div>
                  )}
                  {characteristics.map((c, i) => (
                    <div key={i} className="vip-detail2__char-row">
                      <dt className="vip-detail2__char-label">
                        <c.icon size={16} /> {c.label}
                      </dt>
                      <dd className="vip-detail2__char-value">{c.value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Features & Amenities ── */}
            {property.features.length > 0 && (
              <div className="ds-card ds-mt-6">
                <div className="ds-card__body">
                  <h3 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                    {dict.property.detail.featuresTitle}
                  </h3>
                  <div className="vip-detail2__features">
                    {property.features.map((f) => {
                      const label = dict.property.features[f.feature_key as keyof typeof dict.property.features] ?? f.feature_key
                      return (
                        <div key={f.id} className="vip-detail2__feature">
                          <Check size={16} className="vip-detail2__feature-icon" />
                          <span>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Energy Certificate ── */}
            {property.energy_rating && (
              <div className="ds-card ds-mt-6">
                <div className="ds-card__body">
                  <h3 className="ds-flex ds-items-center ds-gap-2 ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                    <Zap size={18} />
                    {dict.property.detail.energyRating}
                  </h3>
                  <EnergyRatingBadge rating={property.energy_rating} />
                </div>
              </div>
            )}

            {/* ── Location Map (placeholder) ── */}
            {(property.latitude && property.longitude) && (
              <div className="ds-card ds-mt-6">
                <div className="ds-card__body">
                  <h3 className="ds-flex ds-items-center ds-gap-2 ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                    <MapPin size={18} />
                    Ubicación
                  </h3>
                  <div className="vip-detail2__map-placeholder">
                    <MapPin size={32} />
                    <span className="ds-text-sm ds-text-tertiary">{fullAddress}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Mortgage Calculator ── */}
            <div className="ds-mt-6">
              <MortgageCalculator price={property.price} locale={locale} />
            </div>

            {/* ── In-page Contact Form (high-intent users who scrolled all the way) ── */}
            <div className="ds-card ds-mt-6">
              <div className="ds-card__body">
                <h3 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                  {dict.property.contactBtn}
                </h3>
                <p className="ds-text-sm ds-text-secondary ds-mb-4">
                  Sin compromiso · Respuesta en 24h
                </p>
                <div className="ds-flex ds-flex-col ds-gap-3">
                  <input className="ds-input" placeholder={dict.auth.name} />
                  <input className="ds-input" type="email" placeholder={dict.auth.email} />
                  <input className="ds-input" type="tel" placeholder={dict.contactPage.phone} />
                  <textarea
                    className="ds-input"
                    rows={3}
                    placeholder={dict.contactPage.message}
                    defaultValue={`Hola, me interesa la propiedad "${title}" (Ref. ${refCode}).`}
                  />
                  <button className="ds-btn ds-btn--lg">
                    {dict.contactPage.send}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Similar Properties ── */}
            {similarFiltered.length > 0 && (
              <div className="ds-mt-8">
                <h3 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
                  Propiedades similares
                </h3>
                <div className="ds-grid ds-grid-cols-1 ds-sm:grid-cols-2 ds-lg:grid-cols-3 ds-gap-4">
                  {similarFiltered.map((p) => {
                    const pTitle = p[`title_${locale}` as keyof typeof p] || p.title_es
                    const pPrice = fmtPrice(p.price)
                    return (
                      <a
                        key={p.id}
                        href={`/${locale}/properties2/${p.slug}`}
                        className="ds-card ds-card--interactive"
                      >
                        {p.firstImage && (
                          <img
                            src={p.firstImage.url}
                            alt={p.firstImage.alt_text || String(pTitle)}
                            className="ds-card__media"
                          />
                        )}
                        <div className="ds-card__body">
                          <p className="ds-font-semibold ds-text-primary">{pPrice}</p>
                          <p className="ds-text-sm ds-text-secondary ds-mt-1">{String(pTitle)}</p>
                          <div className="ds-flex ds-gap-3 ds-text-xs ds-text-tertiary ds-mt-2">
                            <span>{p.bedrooms} hab</span>
                            <span>{p.bathrooms} baños</span>
                            <span>{p.area} m²</span>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sticky sidebar (desktop) */}
          <aside className="vip-detail2__sidebar">
            <div className="vip-detail2__sidebar-sticky">
              {/* Price card */}
              <div className="ds-card">
                <div className="ds-card__body">
                  <p className="font-display ds-text-2xl ds-font-bold ds-text-primary">
                    {formattedPrice}
                  </p>
                  {pricePerM2 && (
                    <p className="ds-text-xs ds-text-tertiary ds-mt-0-5">
                      {pricePerM2}/m²
                    </p>
                  )}
                  <p className="ds-text-xs ds-text-tertiary ds-mt-1">
                    {dict.property.detail.ref} {refCode}
                  </p>

                  <hr className="ds-divider" />

                  <button className="ds-btn ds-btn--full ds-btn--lg ds-mb-2">
                    <MessageCircle size={16} />
                    {dict.property.contactBtn}
                  </button>
                  <button className="ds-btn ds-btn--full ds-btn--lg ds-btn--outline ds-mb-2">
                    <Phone size={16} />
                    Llamar
                  </button>
                  <button className="ds-btn ds-btn--full ds-btn--outline vip-detail2__whatsapp-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </button>

                  <hr className="ds-divider" />

                  <button className="ds-btn ds-btn--full ds-btn--outline ds-btn--sm">
                    <Heart size={14} />
                    {dict.property.saveBtn}
                  </button>
                </div>
              </div>

              {/* Agent card placeholder */}
              <div className="ds-card ds-mt-4">
                <div className="ds-card__body ds-flex ds-items-center ds-gap-3">
                  <div className="vip-detail2__agent-avatar">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="ds-text-sm ds-font-semibold ds-text-primary">ESYS VIP</p>
                    <p className="ds-text-xs ds-text-tertiary">Inmobiliaria de confianza</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Sticky mobile bottom bar ── */}
      <StickyMobileBar contactLabel={dict.property.contactBtn} price={formattedPrice} />
    </>
  )
}
