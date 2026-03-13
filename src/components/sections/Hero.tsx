import { SearchBar } from '@/components/forms/SearchBar'
import { siteConfig } from '@/config/site'

export function Hero() {
  return (
    <section className="cx-hero">
      <div className="cx-hero__overlay" />
      <div className="cx-hero__content ds-container ds-py-16 ds-md:py-24">
        <h1 className="font-display ds-text-4xl ds-md:text-5xl ds-lg:text-6xl ds-text-primary ds-font-bold ds-mb-4">
          {siteConfig.name}
        </h1>
        <p className="ds-text-lg ds-md:text-xl ds-text-secondary ds-mb-8 ds-mx-auto" style={{ maxWidth: '36rem' }}>
          {siteConfig.description}
        </p>
        <SearchBar />
      </div>
    </section>
  )
}
