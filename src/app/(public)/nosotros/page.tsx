import { siteConfig } from '@/config/site'
import { SEO_CONFIG } from '@/config/seo'

export const metadata = {
  title: SEO_CONFIG.pages.about.title,
  description: SEO_CONFIG.pages.about.description,
}

export default function AboutPage() {
  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        Nosotros
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        Conoce al equipo de {siteConfig.name}.
      </p>

      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-3 ds-gap-6">
        <div className="ds-card">
          <div className="ds-card__body ds-text-center">
            <div className="ds-w-16 ds-h-16 ds-rounded-full ds-bg-elevated ds-mx-auto ds-mb-4" />
            <h3 className="ds-font-semibold ds-text-primary">Equipo</h3>
            <p className="ds-text-sm ds-text-secondary ds-mt-1">Miembro del equipo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
