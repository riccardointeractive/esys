import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface SavedSearchesPageProps {
  params: Promise<{ lang: string }>
}

export default async function SavedSearchesPage({ params }: SavedSearchesPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div>
      <h1 className="ds-section-title ds-mb-6">
        {dict.account.searches}
      </h1>
      <div className="ds-card">
        <div className="ds-card__body ds-text-center ds-py-12">
          <p className="ds-text-secondary">{dict.account.noSearches}</p>
        </div>
      </div>
    </div>
  )
}
