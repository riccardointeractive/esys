import type { Metadata } from 'next'
import Link from 'next/link'
import { Hero } from '@/components/sections/Hero'
import { FeaturedProperties } from '@/components/sections/FeaturedProperties'
import { CTABanner } from '@/components/sections/CTABanner'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { getDefinitions } from '@/lib/definitions'
import { fetchProperties } from '@/lib/properties'
import { hreflang } from '@/lib/seo/alternates'

export const dynamic = 'force-dynamic'

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { lang } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  return {
    title: dict.seo.home.title,
    description: dict.seo.home.description,
    alternates: hreflang.home(locale),
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const routes = localizedRoutes(locale)
  const [typeDefinitions, bedroomDefinitions, featuredProperties] = await Promise.all([
    getDefinitions('property_type'),
    getDefinitions('bedroom_option'),
    fetchProperties({ featured: true, limit: 6 }),
  ])

  return (
    <>
      <Hero dict={dict} typeDefinitions={typeDefinitions} bedroomDefinitions={bedroomDefinitions} />

      <FeaturedProperties dict={dict} locale={locale} properties={featuredProperties} />

      {/* Category cards */}
      <section className="ds-section">
        <div className="ds-container">
          <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-gap-6">
            <Link href={routes.newBuilds} className="ds-card ds-card--interactive ds-p-8">
              <h3 className="ds-heading-ui ds-text-2xl ds-mb-2">
                {dict.categories.newBuild}
              </h3>
              <p className="ds-text-secondary">
                {dict.categories.newBuildDesc}
              </p>
            </Link>
            <Link href={routes.resale} className="ds-card ds-card--interactive ds-p-8">
              <h3 className="ds-heading-ui ds-text-2xl ds-mb-2">
                {dict.categories.resale}
              </h3>
              <p className="ds-text-secondary">
                {dict.categories.resaleDesc}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <CTABanner lang={lang as Locale} dict={dict} />
    </>
  )
}
