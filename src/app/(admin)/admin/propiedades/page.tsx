import Link from 'next/link'
import { ADMIN_ROUTES } from '@/config/routes'

export default function AdminPropertiesPage() {
  return (
    <div>
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
        <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
          Propiedades
        </h1>
        <Link href={ADMIN_ROUTES.propertyNew} className="ds-btn">
          Nueva Propiedad
        </Link>
      </div>

      <div className="ds-card">
        <div className="ds-card__body ds-text-center ds-py-8">
          <p className="ds-text-secondary">No hay propiedades todavía.</p>
        </div>
      </div>
    </div>
  )
}
