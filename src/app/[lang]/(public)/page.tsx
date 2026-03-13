import Link from 'next/link'
import { Hero } from '@/components/sections/Hero'
import { FeaturedProperties } from '@/components/sections/FeaturedProperties'
import { CTABanner } from '@/components/sections/CTABanner'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'

interface HomePageProps {
  params: Promise<{ lang: string }>
}

export default async function HomePage({ params }: HomePageProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  const routes = localizedRoutes(lang as Locale)

  return (
    <>
      <Hero dict={dict} />

      <FeaturedProperties dict={dict} />

      {/* Category cards */}
      <section className="ds-section">
        <div className="ds-container">
          <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-2 ds-gap-6">
            <Link href={routes.newBuilds} className="ds-card ds-card--interactive ds-p-8">
              <h3 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-2">
                {dict.categories.newBuild}
              </h3>
              <p className="ds-text-secondary">
                {dict.categories.newBuildDesc}
              </p>
            </Link>
            <Link href={routes.resale} className="ds-card ds-card--interactive ds-p-8">
              <h3 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-2">
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
