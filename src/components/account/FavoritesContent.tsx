'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
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
    title_en: string
    title_ru: string
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
  const routes = localizedRoutes(locale)
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
      <h1 className="ds-section-title ds-mb-6">
        {t.account.favorites}
      </h1>

      {loading ? (
        <div className="ds-flex ds-justify-center ds-py-12">
          <div className="spinner spinner--md spinner--default" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="ds-empty-state ds-empty-state--card">
          <div className="ds-empty-state__icon">
            <Heart size={32} />
          </div>
          <div className="ds-empty-state__title">{t.account.noFavorites}</div>
          <div className="ds-empty-state__description">{t.account.noFavoritesHint}</div>
          <div className="ds-empty-state__actions">
            <a href={routes.properties} className="ds-btn ds-btn--sm">{t.account.browseProperties}</a>
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
                title={prop[`title_${locale}` as keyof typeof prop] as string || prop.title_es}
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
