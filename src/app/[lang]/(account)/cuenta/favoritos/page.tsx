import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface FavoritesPageProps {
  params: Promise<{ lang: string }>
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        {dict.account.favorites}
      </h1>
      <div className="ds-card">
        <div className="ds-card__body ds-text-center ds-py-12">
          <p className="ds-text-secondary">{dict.account.noFavorites}</p>
        </div>
      </div>
    </div>
  )
}
