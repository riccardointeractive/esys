import { PropertyCard } from '@/components/property/PropertyCard'
import type { Dictionary, Locale } from '@/config/i18n'
import type { Property, PropertyImage } from '@/types/property'

type PropertyWithImage = Property & { firstImage: PropertyImage | null }

interface FeaturedPropertiesProps {
  dict: Dictionary
  locale: Locale
  properties: PropertyWithImage[]
}

export function FeaturedProperties({ dict, locale, properties }: FeaturedPropertiesProps) {
  if (!properties.length) return null

  return (
    <section className="ds-section">
      <div className="ds-container">
        <div className="ds-flex ds-justify-between ds-items-end ds-mb-8">
          <div>
            <h2 className="font-display ds-text-2xl ds-md:text-3xl ds-font-bold ds-text-primary">
              {dict.featured.title}
            </h2>
            <p className="ds-text-secondary ds-mt-2">
              {dict.featured.subtitle}
            </p>
          </div>
        </div>

        <div className="ds-grid ds-grid-cols-1 ds-sm:grid-cols-2 ds-lg:grid-cols-3 ds-gap-6">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              title={p[`title_${locale}`] || p.title_es}
              location={[p.city, p.province].filter(Boolean).join(', ')}
              price={p.price}
              image={p.firstImage?.url}
              bedrooms={p.bedrooms}
              bathrooms={p.bathrooms}
              area={p.area}
              status={p.status as 'available' | 'reserved' | 'sold'}
              category={p.category as 'newBuild' | 'resale'}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
