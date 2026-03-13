import { SearchBar } from '@/components/forms/SearchBar'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface PropertiesPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PropertiesPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.properties.title,
    description: dict.seo.properties.description,
  }
}

export default async function PropertiesPage({ params }: PropertiesPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-6">
        {dict.nav.properties}
      </h1>
      <SearchBar />
      <div className="ds-mt-8">
        <p className="ds-text-secondary">
          {dict.property.results}
        </p>
      </div>
    </div>
  )
}
