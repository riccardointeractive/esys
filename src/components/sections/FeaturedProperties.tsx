import { PropertyCard } from '@/components/property/PropertyCard'
import type { Dictionary } from '@/config/i18n'

/* Placeholder data — will be replaced with Supabase queries */
const PLACEHOLDER_PROPERTIES = [
  {
    slug: 'atico-centro',
    title: 'Ático con terraza en el centro',
    location: 'Centro, Madrid',
    price: 425000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    status: 'available' as const,
    category: 'resale' as const,
  },
  {
    slug: 'villa-costa',
    title: 'Villa moderna con piscina',
    location: 'Costa del Sol, Málaga',
    price: 890000,
    bedrooms: 4,
    bathrooms: 3,
    area: 280,
    status: 'available' as const,
    category: 'newBuild' as const,
  },
  {
    slug: 'piso-playa',
    title: 'Piso a 100m de la playa',
    location: 'Benidorm, Alicante',
    price: 195000,
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    status: 'reserved' as const,
    category: 'resale' as const,
  },
  {
    slug: 'duplex-norte',
    title: 'Dúplex con vistas a la montaña',
    location: 'Santander, Cantabria',
    price: 310000,
    bedrooms: 3,
    bathrooms: 2,
    area: 145,
    status: 'available' as const,
    category: 'newBuild' as const,
  },
  {
    slug: 'estudio-universidad',
    title: 'Estudio reformado zona universitaria',
    location: 'Salamanca',
    price: 95000,
    bedrooms: 1,
    bathrooms: 1,
    area: 38,
    status: 'available' as const,
    category: 'resale' as const,
  },
  {
    slug: 'adosado-parque',
    title: 'Adosado junto al parque',
    location: 'Pozuelo, Madrid',
    price: 520000,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    status: 'available' as const,
    category: 'newBuild' as const,
  },
]

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
