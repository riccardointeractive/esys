'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { API_ROUTES } from '@/config/routes'
import { AUTH_CONFIG } from '@/config/auth'

export function ResetPasswordForm() {
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)

  const [step, setStep] = useState<'request' | 'confirm'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(API_ROUTES.auth.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      const msgKey = data.message as keyof typeof t.auth
      setMessage(t.auth[msgKey] || t.auth.resetSuccess)
      setStep('confirm')
    } catch {
      setError(t.auth.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError(t.auth.errorPasswordMismatch)
      return
    }
    if (newPassword.length < AUTH_CONFIG.minPasswordLength) {
      setError(t.auth.errorPasswordShort)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(API_ROUTES.auth.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        const errorKey = data.error as keyof typeof t.auth
        setError(t.auth[errorKey] || t.auth.errorGeneric)
        return
      }

      const msgKey = data.message as keyof typeof t.auth
      setMessage(t.auth[msgKey] || t.auth.newPasswordSet)
    } catch {
      setError(t.auth.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <h1>{t.auth.resetPassword}</h1>
      </div>
      <div className="ds-card__body">
        {step === 'request' ? (
          <form className="ds-space-y-4" onSubmit={handleRequestReset}>
            <p className="ds-text-sm ds-text-secondary">
              {t.auth.resetPasswordDesc}
            </p>
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.email}</label>
              <input
                type="email"
                className="ds-input ds-w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {loading ? '...' : t.auth.sendResetLink}
            </button>
          </form>
        ) : (
          <form className="ds-space-y-4" onSubmit={handleConfirmReset}>
            {message && (
              <p className="ds-text-sm" style={{ color: 'var(--ds-color-success)' }}>
                {message}
              </p>
            )}
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.resetTokenLabel}</label>
              <input
                type="text"
                className="ds-input ds-w-full"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.newPassword}</label>
              <input
                type="password"
                className="ds-input ds-w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              {loading ? '...' : t.auth.resetPassword}
            </button>
          </form>
        )}
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          <Link href={routes.login} className="ds-text-interactive">
            {t.auth.enter}
          </Link>
        </p>
      </div>
    </div>
  )
}
