import { PropertyCard } from '@/components/property/PropertyCard'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { PLACEHOLDER_PROPERTIES } from '@/config/placeholders'

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
  const dict = getDictionary(lang as Locale)

  const resale = PLACEHOLDER_PROPERTIES.filter((p) => p.category === 'resale')

  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        {dict.nav.resale}
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        {dict.seo.resale.description}
      </p>
      <div className="ds-grid ds-grid-cols-1 ds-sm:grid-cols-2 ds-lg:grid-cols-3 ds-gap-6">
        {resale.map((property) => (
          <PropertyCard key={property.slug} {...property} />
        ))}
      </div>
    </div>
  )
}
