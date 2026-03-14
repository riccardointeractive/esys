import { PropertyCard } from '@/components/property/PropertyCard'
import { PLACEHOLDER_PROPERTIES } from '@/config/placeholders'
import type { Dictionary } from '@/config/i18n'

interface FeaturedPropertiesProps {
  dict: Dictionary
}

export function FeaturedProperties({ dict }: FeaturedPropertiesProps) {
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
          {PLACEHOLDER_PROPERTIES.map((property) => (
            <PropertyCard key={property.slug} {...property} />
          ))}
        </div>
      </div>
    </section>
  )
}
