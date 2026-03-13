import Link from 'next/link'
import { ROUTES } from '@/config/routes'

export function CTABanner() {
  return (
    <section className="ds-section ds-bg-elevated">
      <div className="ds-container ds-text-center">
        <h2 className="font-display ds-text-2xl ds-md:text-3xl ds-font-bold ds-text-primary ds-mb-4">
          ¿Buscas algo especial?
        </h2>
        <p className="ds-text-secondary ds-mb-6 ds-mx-auto" style={{ maxWidth: '32rem' }}>
          Nuestro equipo de profesionales te ayudará a encontrar la propiedad perfecta para ti.
        </p>
        <div className="ds-flex ds-justify-center ds-gap-4">
          <Link href={ROUTES.contact} className="ds-btn ds-btn--lg">
            Contáctanos
          </Link>
          <Link href={ROUTES.properties} className="ds-btn ds-btn--lg ds-btn--outline">
            Ver Propiedades
          </Link>
        </div>
      </div>
    </section>
  )
}
