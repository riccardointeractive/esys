'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { API_ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  propertyId: string
  initialFavorited?: boolean
}

export function FavoriteButton({ propertyId, initialFavorited = false }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const router = useRouter()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      router.push(routes.login)
      return
    }

    if (loading) return
    setLoading(true)

    try {
      const res = await fetch(API_ROUTES.favorites, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      if (res.ok) {
        const data = await res.json()
        setFavorited(data.favorited)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'vip-favorite-btn',
        favorited && 'vip-favorite-btn--active'
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      disabled={loading}
    >
      <Heart
        size={18}
        fill={favorited ? 'currentColor' : 'none'}
      />
    </button>
  )
}
