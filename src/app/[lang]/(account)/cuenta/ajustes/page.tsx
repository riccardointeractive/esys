import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface SettingsPageProps {
  params: Promise<{ lang: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        {dict.account.settings}
      </h1>
      <div className="ds-card">
        <div className="ds-card__body">
          <form className="ds-space-y-4">
            <div className="ds-form-group">
              <label className="ds-label">{dict.auth.name}</label>
              <input type="text" className="ds-input ds-w-full" />
            </div>
            <div className="ds-form-group">
              <label className="ds-label">{dict.auth.email}</label>
              <input type="email" className="ds-input ds-w-full" />
            </div>
            <button type="submit" className="ds-btn">
              {dict.account.save}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
