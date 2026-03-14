import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { PLACEHOLDER_IMAGES } from '@/config/placeholders'

interface PropertyDetailPageProps {
  params: Promise<{ lang: string; slug: string }>
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { lang, slug } = await params
  const dict = getDictionary(lang as Locale)
  const routes = localizedRoutes(lang as Locale)

  return (
    <div className="ds-container ds-py-8">
      <nav className="ds-breadcrumb ds-mb-6">
        <span className="ds-breadcrumb__item">
          <a href={routes.properties} className="ds-breadcrumb__link">{dict.nav.properties}</a>
        </span>
        <span className="ds-breadcrumb__item">
          <span className="ds-breadcrumb__current">{slug}</span>
        </span>
      </nav>

      <div className="ds-grid ds-grid-cols-1 ds-lg:grid-cols-3 ds-gap-8">
        {/* Main content */}
        <div className="ds-lg:col-span-2">
          <div className="ds-card">
            <div className="ds-card__media">
              <img
                src={PLACEHOLDER_IMAGES[0]}
                alt="Imagen principal"
                style={{ width: '100%', height: 400, objectFit: 'cover' }}
              />
            </div>
            <div className="ds-flex ds-gap-2 ds-p-3">
              {PLACEHOLDER_IMAGES.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Imagen ${i + 1}`}
                  className="ds-rounded-md"
                  style={{ width: '33%', height: 80, objectFit: 'cover', opacity: i === 0 ? 1 : 0.7 }}
                />
              ))}
            </div>
            <div className="ds-card__body">
              <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
                {slug}
              </h1>
              <p className="ds-text-secondary ds-mt-4">
                {dict.property.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="ds-card">
            <div className="ds-card__body">
              <p className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-4">
                {dict.property.price}
              </p>
              <button className="ds-btn ds-btn--full ds-btn--lg ds-mb-3">
                {dict.property.contactBtn}
              </button>
              <button className="ds-btn ds-btn--full ds-btn--lg ds-btn--outline">
                {dict.property.saveBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
