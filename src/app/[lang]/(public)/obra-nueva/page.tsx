import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface NewBuildsPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: NewBuildsPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.newBuilds.title,
    description: dict.seo.newBuilds.description,
  }
}

export default async function NewBuildsPage({ params }: NewBuildsPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        {dict.nav.newBuilds}
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        {dict.seo.newBuilds.description}
      </p>
      <p className="ds-text-tertiary">{dict.property.listNewBuilds}</p>
    </div>
  )
}
