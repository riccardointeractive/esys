interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { slug } = await params

  return (
    <div className="ds-container ds-py-8">
      <nav className="ds-breadcrumb ds-mb-6">
        <span className="ds-breadcrumb__item">
          <a href="/propiedades" className="ds-breadcrumb__link">Propiedades</a>
        </span>
        <span className="ds-breadcrumb__item">
          <span className="ds-breadcrumb__current">{slug}</span>
        </span>
      </nav>

      <div className="ds-grid ds-grid-cols-1 ds-lg:grid-cols-3 ds-gap-8">
        {/* Main content */}
        <div className="ds-lg:col-span-2">
          <div className="ds-card">
            <div className="ds-card__media ds-bg-elevated ds-flex ds-items-center ds-justify-center">
              <p className="ds-text-tertiary">Galería de imágenes</p>
            </div>
            <div className="ds-card__body">
              <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
                Propiedad: {slug}
              </h1>
              <p className="ds-text-secondary ds-mt-4">
                Descripción de la propiedad.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="ds-card">
            <div className="ds-card__body">
              <p className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-4">
                Precio
              </p>
              <button className="ds-btn ds-btn--full ds-btn--lg ds-mb-3">
                Contactar
              </button>
              <button className="ds-btn ds-btn--full ds-btn--lg ds-btn--outline">
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
