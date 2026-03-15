'use client'

import { useState, useEffect } from 'react'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { PropertyCard } from '@/components/property/PropertyCard'
import { API_ROUTES } from '@/config/routes'

interface FavoriteProperty {
  id: string
  property_id: string
  image: string | null
  esys_properties: {
    id: string
    title_es: string
    slug: string
    price: number
    area: number
    bedrooms: number
    bathrooms: number
    status: 'available' | 'reserved' | 'sold'
    category: 'newBuild' | 'resale'
    city: string
    province: string
  }
}

export function FavoritesContent() {
  const t = useDictionary()
  const locale = useLocale()
  const [favorites, setFavorites] = useState<FavoriteProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch(API_ROUTES.favorites)
        if (res.ok) {
          const data = await res.json()
          setFavorites(data.favorites || [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        {t.account.favorites}
      </h1>

      {loading ? (
        <p className="ds-text-secondary">{t.common.loading}</p>
      ) : favorites.length === 0 ? (
        <div className="ds-card">
          <div className="ds-card__body ds-text-center ds-py-12">
            <p className="ds-text-secondary">{t.account.noFavorites}</p>
          </div>
        </div>
      ) : (
        <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-lg:grid-cols-3 ds-gap-6">
          {favorites.map((fav) => {
            const prop = fav.esys_properties
            return (
              <PropertyCard
                key={fav.id}
                id={prop.id}
                slug={prop.slug}
                title={prop.title_es}
                location={`${prop.city}, ${prop.province}`}
                price={prop.price}
                image={fav.image || undefined}
                bedrooms={prop.bedrooms}
                bathrooms={prop.bathrooms}
                area={prop.area}
                status={prop.status}
                category={prop.category}
                isFavorited
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
