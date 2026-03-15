'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useDictionary } from '@/components/providers/LocaleProvider'
import { API_ROUTES } from '@/config/routes'

export function AccountDashboard() {
  const { user } = useAuth()
  const t = useDictionary()
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch(API_ROUTES.favorites)
        if (res.ok) {
          const data = await res.json()
          setFavCount(data.favorites?.length || 0)
        }
      } catch {
        // silently fail
      }
    }
    fetchCounts()
  }, [])

  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-2">
        {t.account.myAccount}
      </h1>
      {user && (
        <p className="ds-text-secondary ds-mb-6">
          {user.fullName} (@{user.username})
        </p>
      )}
      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-3 ds-gap-6">
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">{t.account.savedFavorites}</p>
          <p className="ds-stat-card__value">{favCount}</p>
        </div>
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">{t.account.savedSearches}</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">{t.account.activeAlerts}</p>
          <p className="ds-stat-card__value">0</p>
        </div>
      </div>
    </div>
  )
}
