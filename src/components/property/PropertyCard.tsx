import Link from 'next/link'
import { Bed, Bath, Maximize } from 'lucide-react'
import { PROPERTY_STATUS, PROPERTY_CATEGORY } from '@/config/property'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  slug: string
  title: string
  location: string
  price: number
  image?: string
  bedrooms: number
  bathrooms: number
  area: number
  status: keyof typeof PROPERTY_STATUS
  category: keyof typeof PROPERTY_CATEGORY
}

export function PropertyCard({
  slug,
  title,
  location,
  price,
  image,
  bedrooms,
  bathrooms,
  area,
  status,
  category,
}: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)

  return (
    <Link href={`/propiedades/${slug}`}>
      <article className="ds-card ds-card--interactive">
        {/* Image */}
        {image ? (
          <img
            src={image}
            alt={title}
            className="ds-card__media"
            loading="lazy"
          />
        ) : (
          <div className="ds-card__media ds-bg-elevated ds-flex ds-items-center ds-justify-center">
            <Maximize size={32} className="ds-text-tertiary" />
          </div>
        )}

        {/* Body */}
        <div className="ds-card__body">
          <div className="ds-flex ds-justify-between ds-items-start ds-gap-2">
            <h3 className="ds-text-base ds-font-semibold ds-text-primary ds-line-clamp-1">
              {title}
            </h3>
            <span
              className={cn(
                'ds-badge',
                status === 'available' && 'ds-badge--success',
                status === 'reserved' && 'ds-badge--warning',
                status === 'sold' && 'ds-badge--error'
              )}
            >
              {PROPERTY_STATUS[status]}
            </span>
          </div>

          <p className="ds-text-sm ds-text-secondary ds-mt-1">{location}</p>

          <p className="font-display ds-text-xl ds-font-bold ds-text-primary ds-mt-3">
            {formattedPrice}
          </p>

          <div className="ds-flex ds-gap-4 ds-text-sm ds-text-tertiary ds-mt-3">
            <span className="ds-flex ds-items-center ds-gap-1">
              <Bed size={14} /> {bedrooms}
            </span>
            <span className="ds-flex ds-items-center ds-gap-1">
              <Bath size={14} /> {bathrooms}
            </span>
            <span className="ds-flex ds-items-center ds-gap-1">
              <Maximize size={14} /> {area} m&sup2;
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="ds-card__footer">
          <span className="ds-badge ds-badge--outline">
            {PROPERTY_CATEGORY[category]}
          </span>
        </div>
      </article>
    </Link>
  )
}
