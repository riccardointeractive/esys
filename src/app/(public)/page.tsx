import { Hero } from '@/components/sections/Hero'
import { FeaturedProperties } from '@/components/sections/FeaturedProperties'
import { CTABanner } from '@/components/sections/CTABanner'
import { ROUTES } from '@/config/routes'
import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <Hero />

      <FeaturedProperties />

      {/* Category cards */}
      <section className="ds-section">
        <div className="ds-container">
          <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-gap-6">
            <Link href={ROUTES.newBuilds} className="ds-card ds-card--interactive ds-p-8">
              <h3 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-2">
                Obra Nueva
              </h3>
              <p className="ds-text-secondary">
                Promociones de nueva construcción con las mejores calidades y diseño.
              </p>
            </Link>
            <Link href={ROUTES.resale} className="ds-card ds-card--interactive ds-p-8">
              <h3 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-2">
                Segunda Mano
              </h3>
              <p className="ds-text-secondary">
                Propiedades seleccionadas por nuestro equipo, listas para entrar a vivir.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  )
}
