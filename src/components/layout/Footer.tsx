import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { ROUTES } from '@/config/routes'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="ds-container">
        <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-4 ds-gap-8">
          {/* Brand */}
          <div>
            <Link href={ROUTES.home} className="font-display ds-text-lg ds-text-primary">
              {siteConfig.name}
            </Link>
            <p className="ds-text-sm ds-text-secondary ds-mt-3">
              {siteConfig.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="ds-text-sm ds-font-semibold ds-text-primary ds-mb-4">
              Navegación
            </h4>
            <ul className="ds-space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="ds-text-sm ds-text-secondary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="ds-text-sm ds-font-semibold ds-text-primary ds-mb-4">
              Contacto
            </h4>
            <ul className="ds-space-y-2 ds-text-sm ds-text-secondary">
              {siteConfig.contact.email && (
                <li>{siteConfig.contact.email}</li>
              )}
              {siteConfig.contact.phone && (
                <li>{siteConfig.contact.phone}</li>
              )}
              {siteConfig.contact.address && (
                <li>{siteConfig.contact.address}</li>
              )}
              {siteConfig.contact.city && (
                <li>
                  {siteConfig.contact.city}, {siteConfig.contact.country}
                </li>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="ds-text-sm ds-font-semibold ds-text-primary ds-mb-4">
              Legal
            </h4>
            <ul className="ds-space-y-2 ds-text-sm ds-text-secondary">
              <li>
                <Link href={ROUTES.contact}>Contacto</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="site-footer__bottom">
          <p className="ds-text-xs ds-text-tertiary">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
