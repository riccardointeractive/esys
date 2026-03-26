import { siteConfig } from '@/config/site'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface AboutPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: AboutPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.about.title,
    description: dict.seo.about.description,
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div className="ds-container ds-py-8">
      <h1 className="ds-font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        {dict.aboutPage.title}
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        {dict.aboutPage.subtitle} {siteConfig.name}.
      </p>

      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-3 ds-gap-6">
        <div className="ds-card">
          <div className="ds-card__body ds-text-center">
            <div className="ds-w-16 ds-h-16 ds-rounded-full ds-bg-elevated ds-mx-auto ds-mb-4" />
            <h3 className="ds-font-semibold ds-text-primary">{dict.aboutPage.team}</h3>
            <p className="ds-text-sm ds-text-secondary ds-mt-1">{dict.aboutPage.teamMember}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
