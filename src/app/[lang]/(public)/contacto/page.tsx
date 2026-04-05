import { siteConfig } from '@/config/site'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { ContactForm } from '@/components/forms/ContactForm'

interface ContactPageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: ContactPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.contact.title,
    description: dict.seo.contact.description,
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  return (
    <div className="ds-container ds-py-8">
      <h1 className="ds-font-display ds-text-3xl ds-font-bold ds-text-primary ds-mb-4">
        {dict.contactPage.title}
      </h1>
      <p className="ds-text-secondary ds-mb-8">
        {dict.contactPage.subtitle}
      </p>

      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-gap-8">
        {/* Contact form */}
        <div className="ds-card">
          <div className="ds-card__header">
            <h2>{dict.contactPage.formTitle}</h2>
          </div>
          <div className="ds-card__body">
            <ContactForm
              dict={dict}
              turnstileSiteKey={turnstileSiteKey}
              locale={lang}
            />
          </div>
        </div>

        {/* Contact info */}
        <div>
          <div className="ds-card ds-mb-6">
            <div className="ds-card__body">
              <h3 className="ds-font-semibold ds-text-primary ds-mb-4">
                {dict.contactPage.info}
              </h3>
              <ul className="ds-space-y-3 ds-text-secondary">
                {siteConfig.contact.email && (
                  <li>Email: {siteConfig.contact.email}</li>
                )}
                {siteConfig.contact.phone && (
                  <li>{dict.contactPage.phone}: {siteConfig.contact.phone}</li>
                )}
                {siteConfig.contact.address && (
                  <li>{siteConfig.contact.address}</li>
                )}
              </ul>
            </div>
          </div>
          <div className="ds-card">
            <div className="ds-card__body">
              <p className="ds-text-tertiary">{dict.contactPage.map}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
