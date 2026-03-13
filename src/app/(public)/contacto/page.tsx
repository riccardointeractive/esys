import { siteConfig } from '@/config/site'
import { SEO_CONFIG } from '@/config/seo'

export const metadata = {
  title: SEO_CONFIG.pages.contact.title,
  description: SEO_CONFIG.pages.contact.description,
}

export default function ContactPage() {
  return (
    <div className="ds-container ds-py-8">
      <h1 className="font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        Contacto
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        Estamos aquí para ayudarte.
      </p>

      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-gap-8">
        {/* Contact form */}
        <div className="ds-card">
          <div className="ds-card__header">
            <h2>Envíanos un mensaje</h2>
          </div>
          <div className="ds-card__body">
            <form className="ds-space-y-4">
              <div className="ds-form-group">
                <label className="ds-label">Nombre</label>
                <input type="text" className="ds-input ds-w-full" />
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Email</label>
                <input type="email" className="ds-input ds-w-full" />
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Teléfono</label>
                <input type="tel" className="ds-input ds-w-full" />
              </div>
              <div className="ds-form-group">
                <label className="ds-label">Mensaje</label>
                <textarea className="ds-textarea ds-w-full" rows={4} />
              </div>
              <button type="submit" className="ds-btn ds-btn--full">
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Contact info */}
        <div>
          <div className="ds-card ds-mb-6">
            <div className="ds-card__body">
              <h3 className="ds-font-semibold ds-text-primary ds-mb-4">
                Información de contacto
              </h3>
              <ul className="ds-space-y-3 ds-text-secondary">
                {siteConfig.contact.email && (
                  <li>Email: {siteConfig.contact.email}</li>
                )}
                {siteConfig.contact.phone && (
                  <li>Teléfono: {siteConfig.contact.phone}</li>
                )}
                {siteConfig.contact.address && (
                  <li>Dirección: {siteConfig.contact.address}</li>
                )}
              </ul>
            </div>
          </div>
          <div className="ds-card">
            <div className="ds-card__body">
              <p className="ds-text-tertiary">Mapa integrado (próximamente)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
