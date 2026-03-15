'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'

export function LoginForm() {
  const { login } = useAuth()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [requires2fa, setRequires2fa] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password, requires2fa ? totpCode : undefined)

    if (result.requires2fa) {
      setRequires2fa(true)
      setLoading(false)
      return
    }

    if (!result.success) {
      const errorKey = result.error as keyof typeof t.auth
      setError(t.auth[errorKey] || t.auth.errorGeneric)
      setLoading(false)
      return
    }

    router.push(routes.account)
  }

  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <h1>{t.auth.login}</h1>
      </div>
      <div className="ds-card__body">
        <form className="ds-space-y-4" onSubmit={handleSubmit}>
          <div className="ds-form-group">
            <label className="ds-label">{t.auth.email}</label>
            <input
              type="email"
              className="ds-input ds-w-full"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={requires2fa}
            />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{t.auth.password}</label>
            <input
              type="password"
              className="ds-input ds-w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={requires2fa}
            />
          </div>

          {requires2fa && (
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.totpCode}</label>
              <input
                type="text"
                className="ds-input ds-w-full"
                placeholder={t.auth.totpPlaceholder}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
                autoFocus
                required
              />
              <p className="ds-text-sm ds-text-secondary ds-mt-1">
                {t.auth.enterCode}
              </p>
            </div>
          )}

          {error && (
            <p className="ds-text-sm" style={{ color: 'var(--ds-color-error)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="ds-btn ds-btn--full ds-btn--lg"
            disabled={loading}
          >
            {loading ? '...' : t.auth.enter}
          </button>

          <div className="ds-text-center">
            <Link href={routes.resetPassword} className="ds-text-sm ds-text-interactive">
              {t.auth.forgotPassword}
            </Link>
          </div>
        </form>
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          {t.auth.noAccount}{' '}
          <Link href={routes.register} className="ds-text-interactive">
            {t.auth.signUp}
          </Link>
        </p>
      </div>
    </div>
  )
}
