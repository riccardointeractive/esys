'use client'

import { useState, useEffect } from 'react'
import { Search, Shield, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  username: string
  full_name: string
  totp_enabled: boolean
  email_verified: boolean
  last_login_at: string | null
  created_at: string
}

export function AdminUsersContent() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const limit = 20

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        })
        if (search) params.set('search', search)

        const res = await fetch(`/api/admin/users?${params}`)
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users)
          setTotal(data.total)
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [page, search])

  const handleDisable2fa = async (userId: string) => {
    if (!confirm('¿Desactivar 2FA para este usuario?')) return
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'disable2fa' }),
      })
      if (res.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, totp_enabled: false } : u
        ))
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div>
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
        <h1 className="ds-font-display ds-text-2xl ds-font-bold ds-text-primary">
          Usuarios
        </h1>
        <span className="ds-badge">{total} total</span>
      </div>

      {/* Toolbar */}
      <div className="ds-flex ds-flex-wrap ds-gap-3 ds-items-center ds-mb-4">
        <div className="ds-input-group ds-flex-1" style={{ minWidth: 200 }}>
          <div className="ds-input-group__icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="ds-input ds-input--lg"
            placeholder="Nombre, email o username..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
          />
        </div>
      </div>

      <div className="ds-card">
        <div className="ds-table-wrapper">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Username</th>
                <th style={{ width: 60 }}>2FA</th>
                <th>Registro</th>
                <th>Último acceso</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">Cargando...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">No hay usuarios registrados.</span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="ds-font-medium">{user.full_name}</td>
                    <td className="ds-text-secondary">{user.email}</td>
                    <td className="ds-text-secondary">@{user.username}</td>
                    <td className="ds-text-center">
                      {user.totp_enabled ? (
                        <button
                          type="button"
                          onClick={() => handleDisable2fa(user.id)}
                          disabled={actionLoading === user.id}
                          className="ds-btn ds-btn--ghost ds-btn--xs"
                          title="Desactivar 2FA"
                        >
                          <ShieldCheck size={14} className="ds-text-interactive" />
                        </button>
                      ) : (
                        <Shield size={14} className="ds-text-tertiary ds-inline" />
                      )}
                    </td>
                    <td className="ds-text-secondary">{formatDate(user.created_at)}</td>
                    <td className="ds-text-secondary">
                      {user.last_login_at ? formatDate(user.last_login_at) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ds-card__footer ds-flex ds-justify-between ds-items-center">
            <span className="ds-text-sm ds-text-secondary">
              {total} usuario{total !== 1 ? 's' : ''} en total
            </span>
            <div className="ds-flex ds-gap-2 ds-items-center">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="ds-btn ds-btn--ghost ds-btn--sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="ds-text-sm">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="ds-btn ds-btn--ghost ds-btn--sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
