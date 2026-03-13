import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { localizedRoutes } from '@/config/i18n/routes'
import type { Locale, Dictionary } from '@/config/i18n'

interface FooterProps {
  lang: Locale
  dict: Dictionary
}

export function Footer({ lang, dict }: FooterProps) {
  const routes = localizedRoutes(lang)

  const navItems = [
    { label: dict.nav.home, href: routes.home },
    { label: dict.nav.properties, href: routes.properties },
    { label: dict.nav.newBuilds, href: routes.newBuilds },
    { label: dict.nav.resale, href: routes.resale },
    { label: dict.nav.about, href: routes.about },
    { label: dict.nav.contact, href: routes.contact },
  ]

  return (
    <footer className="site-footer">
      <div className="ds-container">
        <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-4 ds-gap-8">
          <div>
            <Link href={routes.home} className="font-display ds-text-lg ds-text-primary">
              {siteConfig.name}
            </Link>
            <p className="ds-text-sm ds-text-secondary ds-mt-3">
              {dict.hero.subtitle}
            </p>
          </div>

          <div>
            <h4 className="ds-text-sm ds-font-semibold ds-text-primary ds-mb-4">
              {dict.footer.navigation}
            </h4>
            <ul className="ds-space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="ds-text-sm ds-text-secondary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="ds-text-sm ds-font-semibold ds-text-primary ds-mb-4">
              {dict.footer.contact}
            </h4>
            <ul className="ds-space-y-2 ds-text-sm ds-text-secondary">
              {siteConfig.contact.email && <li>{siteConfig.contact.email}</li>}
              {siteConfig.contact.phone && <li>{siteConfig.contact.phone}</li>}
              {siteConfig.contact.address && <li>{siteConfig.contact.address}</li>}
              {siteConfig.contact.city && (
                <li>{siteConfig.contact.city}, {siteConfig.contact.country}</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="ds-text-sm ds-font-semibold ds-text-primary ds-mb-4">
              {dict.footer.legal}
            </h4>
            <ul className="ds-space-y-2 ds-text-sm ds-text-secondary">
              <li><Link href={routes.contact}>{dict.nav.contact}</Link></li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p className="ds-text-xs ds-text-tertiary">
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
