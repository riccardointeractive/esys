'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { AUTH_CONFIG } from '@/config/auth'

export function RegisterForm() {
  const { register } = useAuth()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (password !== confirmPassword) {
      setError(t.auth.errorPasswordMismatch)
      return
    }
    if (password.length < AUTH_CONFIG.minPasswordLength) {
      setError(t.auth.errorPasswordShort)
      return
    }
    if (username.length < AUTH_CONFIG.minUsernameLength) {
      setError(t.auth.errorUsernameShort)
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError(t.auth.errorUsernameInvalid)
      return
    }

    setLoading(true)

    const result = await register({
      email,
      username,
      fullName,
      password,
      confirmPassword,
    })

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
        <h1>{t.auth.register}</h1>
      </div>
      <div className="ds-card__body">
        <form className="ds-space-y-4" onSubmit={handleSubmit}>
          <div className="ds-form-group">
            <label className="ds-label">{t.auth.name}</label>
            <input
              type="text"
              className="ds-input ds-w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{t.auth.username}</label>
            <input
              type="text"
              className="ds-input ds-w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={AUTH_CONFIG.minUsernameLength}
              maxLength={AUTH_CONFIG.maxUsernameLength}
              pattern="[a-zA-Z0-9_]+"
            />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{t.auth.email}</label>
            <input
              type="email"
              className="ds-input ds-w-full"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              minLength={AUTH_CONFIG.minPasswordLength}
            />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">{t.auth.confirmPassword}</label>
            <input
              type="password"
              className="ds-input ds-w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

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
            {loading ? '...' : t.auth.signUp}
          </button>
        </form>
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          {t.auth.hasAccount}{' '}
          <Link href={routes.login} className="ds-text-interactive">
            {t.auth.enter}
          </Link>
        </p>
      </div>
    </div>
  )
}
