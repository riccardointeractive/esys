import { SearchBar } from '@/components/forms/SearchBar'
import { SEO_CONFIG } from '@/config/seo'

export const metadata = {
  title: SEO_CONFIG.pages.properties.title,
  description: SEO_CONFIG.pages.properties.description,
}

export default function PropertiesPage() {
  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-6">
        Propiedades
      </h1>
      <SearchBar />
      <div className="ds-mt-8">
        <p className="ds-text-secondary">
          Resultados de búsqueda aparecerán aquí.
        </p>
      </div>
    </div>
  )
}
