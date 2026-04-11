import { PropertyCard } from '@/components/property/PropertyCard'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { fetchProperties } from '@/lib/properties'

export const dynamic = 'force-dynamic'

interface ResalePageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ResalePageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.resale.title,
    description: dict.seo.resale.description,
  }
}

export default async function ResalePage({ params }: ResalePageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)

  const properties = await fetchProperties({ category: 'resale' })

  return (
    <div className="ds-container ds-py-8">
      <h1 className="ds-section-title ds-mb-4">
        {dict.nav.resale}
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        {dict.seo.resale.description}
      </p>
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
  )
}
