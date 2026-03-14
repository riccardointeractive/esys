import { SearchBar } from '@/components/forms/SearchBar'
import type { Dictionary } from '@/config/i18n'

interface HeroProps {
  dict: Dictionary
}

export function Hero({ dict }: HeroProps) {
  return (
    <section
      className="cx-hero"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&h=900&fit=crop&q=80)',
      }}
    >
      <div className="cx-hero__overlay" />
      <div className="cx-hero__content ds-container ds-py-16 ds-md:py-24">
        <h1 className="font-display ds-text-4xl ds-md:text-5xl ds-lg:text-6xl ds-text-primary ds-font-bold ds-mb-4">
          {dict.hero.title}
        </h1>
        <p className="ds-text-lg ds-md:text-xl ds-text-secondary ds-mb-8 ds-mx-auto" style={{ maxWidth: '36rem' }}>
          {dict.hero.subtitle}
        </p>
        <SearchBar />
      </div>
    </section>
  )
}
