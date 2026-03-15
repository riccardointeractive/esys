'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDictionary } from '@/components/providers/LocaleProvider'
import { API_ROUTES } from '@/config/routes'
import { AUTH_CONFIG } from '@/config/auth'

export function SettingsContent() {
  const { user, refreshSession } = useAuth()
  const t = useDictionary()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')

  // Profile
  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)

  // Change password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [loadingPassword, setLoadingPassword] = useState(false)

  // 2FA
  const [totpEnabled, setTotpEnabled] = useState(false)
  const [totpSetupUri, setTotpSetupUri] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [twoFaMsg, setTwoFaMsg] = useState('')
  const [twoFaError, setTwoFaError] = useState('')
  const [loading2fa, setLoading2fa] = useState(false)

  useEffect(() => {
    if (user) {
      setFullName(user.fullName)
      setEmail(user.email)
      setUsername(user.username)
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileMsg('')
    setLoadingProfile(true)

    try {
      const res = await fetch(API_ROUTES.auth.updateProfile, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email }),
      })
      const data = await res.json()

      if (!res.ok) {
        const errKey = data.error as keyof typeof t.auth
        setProfileError(t.auth[errKey] || t.auth.errorGeneric)
        return
      }

      const msgKey = data.message as keyof typeof t.auth
      setProfileMsg(t.auth[msgKey] || t.account.saved)
      await refreshSession()
    } catch {
      setProfileError(t.auth.errorGeneric)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMsg('')

    if (newPassword !== confirmPassword) {
      setPasswordError(t.auth.errorPasswordMismatch)
      return
    }
    if (newPassword.length < AUTH_CONFIG.minPasswordLength) {
      setPasswordError(t.auth.errorPasswordShort)
      return
    }

    setLoadingPassword(true)
    try {
      const res = await fetch(API_ROUTES.auth.changePassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()

      if (!res.ok) {
        const errKey = data.error as keyof typeof t.auth
        setPasswordError(t.auth[errKey] || t.auth.errorGeneric)
        return
      }

      const msgKey = data.message as keyof typeof t.auth
      setPasswordMsg(t.auth[msgKey] || t.auth.newPasswordSet)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError(t.auth.errorGeneric)
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleSetup2fa = async () => {
    setLoading2fa(true)
    setTwoFaError('')

    try {
      const res = await fetch(API_ROUTES.auth.setup2fa)
      if (res.ok) {
        const data = await res.json()
        setTotpSetupUri(data.uri)
      }
    } catch {
      setTwoFaError(t.auth.errorGeneric)
    } finally {
      setLoading2fa(false)
    }
  }

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading2fa(true)
    setTwoFaError('')

    try {
      const res = await fetch(API_ROUTES.auth.setup2fa, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totpCode }),
      })

      const data = await res.json()
      if (res.ok) {
        setTotpEnabled(true)
        setTotpSetupUri('')
        setTotpCode('')
        const msgKey = data.message as keyof typeof t.auth
        setTwoFaMsg(t.auth[msgKey] || t.auth.twoFactorEnabled)
      } else {
        const errKey = data.error as keyof typeof t.auth
        setTwoFaError(t.auth[errKey] || t.auth.errorGeneric)
      }
    } catch {
      setTwoFaError(t.auth.errorGeneric)
    } finally {
      setLoading2fa(false)
    }
  }

  const handleDisable2fa = async () => {
    setLoading2fa(true)
    try {
      const res = await fetch(API_ROUTES.auth.setup2fa, { method: 'DELETE' })
      if (res.ok) {
        setTotpEnabled(false)
        const data = await res.json()
        const msgKey = data.message as keyof typeof t.auth
        setTwoFaMsg(t.auth[msgKey] || t.auth.twoFactorDisabled)
      }
    } catch {
      setTwoFaError(t.auth.errorGeneric)
    } finally {
      setLoading2fa(false)
    }
  }

  return (
    <div className="ds-space-y-8">
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
        {t.account.settings}
      </h1>

      {/* ─── Profile ─── */}
      <div className="ds-card">
        <div className="ds-card__header">
          <h2 className="ds-text-lg ds-font-semibold ds-text-primary">
            {t.account.myAccount}
          </h2>
        </div>
        <div className="ds-card__body">
          <form onSubmit={handleSaveProfile} className="ds-space-y-4">
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.name}</label>
              <input
                type="text"
                className="ds-input ds-w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.username}</label>
              <input
                type="text"
                className="ds-input ds-w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.email}</label>
              <input
                type="email"
                className="ds-input ds-w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {profileError && (
              <p className="ds-text-sm" style={{ color: 'var(--ds-color-error)' }}>
                {profileError}
              </p>
            )}
            {profileMsg && (
              <p className="ds-text-sm" style={{ color: 'var(--ds-color-success)' }}>
                {profileMsg}
              </p>
            )}
            <button type="submit" className="ds-btn" disabled={loadingProfile}>
              {loadingProfile ? '...' : t.account.save}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Change Password ─── */}
      <div className="ds-card">
        <div className="ds-card__header">
          <h2 className="ds-text-lg ds-font-semibold ds-text-primary">
            {t.auth.changePassword}
          </h2>
        </div>
        <div className="ds-card__body">
          <form onSubmit={handleChangePassword} className="ds-space-y-4">
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.currentPassword}</label>
              <input
                type="password"
                className="ds-input ds-w-full"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="ds-form-group">
              <label className="ds-label">{t.auth.newPassword}</label>
              <input
                type="password"
                className="ds-input ds-w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
              />
            </div>
            {passwordError && (
              <p className="ds-text-sm" style={{ color: 'var(--ds-color-error)' }}>
                {passwordError}
              </p>
            )}
            {passwordMsg && (
              <p className="ds-text-sm" style={{ color: 'var(--ds-color-success)' }}>
                {passwordMsg}
              </p>
            )}
            <button type="submit" className="ds-btn" disabled={loadingPassword}>
              {loadingPassword ? '...' : t.auth.changePassword}
            </button>
          </form>
        </div>
      </div>

      {/* ─── Two-Factor Authentication ─── */}
      <div className="ds-card">
        <div className="ds-card__header">
          <h2 className="ds-text-lg ds-font-semibold ds-text-primary">
            {t.auth.twoFactor}
          </h2>
        </div>
        <div className="ds-card__body">
          <p className="ds-text-sm ds-text-secondary ds-mb-4">
            {t.auth.twoFactorDesc}
          </p>

          {twoFaMsg && (
            <p className="ds-text-sm ds-mb-4" style={{ color: 'var(--ds-color-success)' }}>
              {twoFaMsg}
            </p>
          )}
          {twoFaError && (
            <p className="ds-text-sm ds-mb-4" style={{ color: 'var(--ds-color-error)' }}>
              {twoFaError}
            </p>
          )}

          {totpEnabled ? (
            <button
              onClick={handleDisable2fa}
              className="ds-btn ds-btn--secondary"
              disabled={loading2fa}
            >
              {t.auth.disable2fa}
            </button>
          ) : totpSetupUri ? (
            <form onSubmit={handleVerify2fa} className="ds-space-y-4">
              <p className="ds-text-sm ds-text-secondary">
                {t.auth.scanQr}
              </p>
              <div className="ds-bg-elevated ds-p-4 ds-rounded-lg">
                <code className="ds-text-xs ds-break-all">{totpSetupUri}</code>
              </div>
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
                  required
                />
              </div>
              <button
                type="submit"
                className="ds-btn"
                disabled={loading2fa}
              >
                {t.auth.enable2fa}
              </button>
            </form>
          ) : (
            <button
              onClick={handleSetup2fa}
              className="ds-btn"
              disabled={loading2fa}
            >
              {t.auth.enable2fa}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
