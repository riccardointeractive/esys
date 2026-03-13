import { SEO_CONFIG } from '@/config/seo'

export const metadata = {
  title: SEO_CONFIG.pages.resale.title,
  description: SEO_CONFIG.pages.resale.description,
}

export default function ResalePage() {
  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        Segunda Mano
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        Propiedades seleccionadas por nuestro equipo.
      </p>
      <p className="ds-text-tertiary">Listado de propiedades de segunda mano.</p>
    </div>
  )
}
