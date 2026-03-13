import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface AccountPageProps {
  params: Promise<{ lang: string }>
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        {dict.account.myAccount}
      </h1>
      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-3 ds-gap-6">
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">{dict.account.savedFavorites}</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">{dict.account.savedSearches}</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">{dict.account.activeAlerts}</p>
          <p className="ds-stat-card__value">0</p>
        </div>
      </div>
    </div>
  )
}
