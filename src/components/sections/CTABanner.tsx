import Link from 'next/link'
import { localizedRoutes } from '@/config/i18n/routes'
import type { Locale, Dictionary } from '@/config/i18n'

interface CTABannerProps {
  lang: Locale
  dict: Dictionary
}

export function CTABanner({ lang, dict }: CTABannerProps) {
  const routes = localizedRoutes(lang)

  return (
    <section className="ds-section ds-bg-elevated">
      <div className="ds-container ds-text-center">
        <h2 className="ds-section-title ds-mb-4">
          {dict.cta.title}
        </h2>
        <p className="ds-text-secondary ds-mb-6 ds-mx-auto" style={{ maxWidth: '32rem' }}>
          {dict.cta.subtitle}
        </p>
        <div className="ds-flex ds-justify-center ds-gap-4">
          <Link href={routes.contact} className="ds-btn ds-btn--lg">
            {dict.cta.contact}
          </Link>
          <Link href={routes.properties} className="ds-btn ds-btn--lg ds-btn--outline">
            {dict.cta.viewAll}
          </Link>
        </div>
      </div>
    </section>
  )
}
