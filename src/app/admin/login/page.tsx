'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import { ADMIN_ROUTES } from '@/config/routes'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error de autenticación')
      }

      router.push(ADMIN_ROUTES.dashboard)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ds-flex ds-items-center ds-justify-center ds-min-h-screen ds-bg-base">
      <div className="ds-card" style={{ width: '100%', maxWidth: 400 }}>
        <div className="ds-card__body ds-p-8">
          <div className="ds-flex ds-flex-col ds-items-center ds-mb-6">
            <div className="ds-flex ds-items-center ds-justify-center ds-rounded-full ds-bg-elevated ds-mb-4" style={{ width: 48, height: 48 }}>
              <Lock size={24} className="ds-text-secondary" />
            </div>
            <h1 className="ds-font-display ds-text-xl ds-font-bold ds-text-primary">
              Admin
            </h1>
          </div>

          {error && (
            <div className="ds-alert ds-alert--error ds-mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="ds-flex ds-flex-col ds-gap-4">
            <input
              type="password"
              className="ds-input ds-input--lg"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            <button
              type="submit"
              className="ds-btn ds-btn--lg ds-btn--full"
              disabled={loading}
            >
              {loading ? <Loader2 size={18} className="ds-animate-spin" /> : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
