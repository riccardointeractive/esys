import { PropertySearchBar } from '@/components/forms/PropertySearchBar'
import { PropertyCard } from '@/components/property/PropertyCard'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { getDefinitions } from '@/lib/definitions'
import { fetchProperties } from '@/lib/properties'

interface PropertiesPageProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ location?: string; type?: string; bedrooms?: string }>
}

export async function generateMetadata({ params }: PropertiesPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.properties.title,
    description: dict.seo.properties.description,
  }
}

export default async function PropertiesPage({ params, searchParams }: PropertiesPageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const sp = await searchParams

  const [typeDefinitions, bedroomDefinitions, properties] = await Promise.all([
    getDefinitions('property_type'),
    getDefinitions('bedroom_option'),
    fetchProperties({
      location: sp.location || undefined,
      type: sp.type || undefined,
      bedrooms: sp.bedrooms ? Number(sp.bedrooms) : undefined,
    }),
  ])

  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-6">
        {dict.nav.properties}
      </h1>
      <PropertySearchBar typeDefinitions={typeDefinitions} bedroomDefinitions={bedroomDefinitions} />
      <div className="ds-grid ds-grid-cols-1 ds-sm:grid-cols-2 ds-lg:grid-cols-3 ds-gap-6 ds-mt-8">
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
  )
}
