import Link from 'next/link'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'

interface RegisterPageProps {
  params: Promise<{ lang: string }>
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  const routes = localizedRoutes(lang as Locale)

  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <h1>{dict.auth.register}</h1>
      </div>
      <div className="ds-card__body">
        <form className="ds-space-y-4">
          <div className="ds-form-group">
            <label className="ds-label">{dict.auth.name}</label>
            <input type="text" className="ds-input ds-w-full" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{dict.auth.email}</label>
            <input type="email" className="ds-input ds-w-full" placeholder="tu@email.com" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{dict.auth.password}</label>
            <input type="password" className="ds-input ds-w-full" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{dict.auth.confirmPassword}</label>
            <input type="password" className="ds-input ds-w-full" />
          </div>
          <button type="submit" className="ds-btn ds-btn--full ds-btn--lg">
            {dict.auth.signUp}
          </button>
        </form>
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          {dict.auth.hasAccount}{' '}
          <Link href={routes.login} className="ds-text-interactive">
            {dict.auth.enter}
          </Link>
        </p>
      </div>
    </div>
  )
}
