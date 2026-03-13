import { SEO_CONFIG } from '@/config/seo'

export const metadata = {
  title: SEO_CONFIG.pages.newBuilds.title,
  description: SEO_CONFIG.pages.newBuilds.description,
}

export default function NewBuildsPage() {
  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        Obra Nueva
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        Promociones de nueva construcción con las mejores calidades.
      </p>
      <p className="ds-text-tertiary">Listado de propiedades de obra nueva.</p>
    </div>
  )
}
