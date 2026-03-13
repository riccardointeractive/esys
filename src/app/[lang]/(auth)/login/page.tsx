import Link from 'next/link'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'

interface LoginPageProps {
  params: Promise<{ lang: string }>
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  const routes = localizedRoutes(lang as Locale)

  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <h1>{dict.auth.login}</h1>
      </div>
      <div className="ds-card__body">
        <form className="ds-space-y-4">
          <div className="ds-form-group">
            <label className="ds-label">{dict.auth.email}</label>
            <input type="email" className="ds-input ds-w-full" placeholder="tu@email.com" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{dict.auth.password}</label>
            <input type="password" className="ds-input ds-w-full" />
          </div>
          <button type="submit" className="ds-btn ds-btn--full ds-btn--lg">
            {dict.auth.enter}
          </button>
        </form>
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          {dict.auth.noAccount}{' '}
          <Link href={routes.register} className="ds-text-interactive">
            {dict.auth.signUp}
          </Link>
        </p>
      </div>
    </div>
  )
}
