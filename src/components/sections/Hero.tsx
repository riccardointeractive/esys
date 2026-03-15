import { SearchBar } from '@/components/forms/SearchBar'
import type { Dictionary } from '@/config/i18n'

// Alicante — sunset with palm trees (Unsplash: Pe_SJm0aHqs)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1680537732160-01750bae5217?w=1920&h=1080&fit=crop&q=80'

interface HeroProps {
  dict: Dictionary
}

export function Hero({ dict }: HeroProps) {
  return (
    <section
      className="cx-hero cx-hero--full"
      style={{
        backgroundImage: `url(${HERO_IMAGE})`,
      }}
    >
      <div className="cx-hero__content ds-container ds-py-16 ds-md:py-24">
        <div className="cx-hero__backdrop">
          <h1 className="font-display ds-text-4xl ds-md:text-5xl ds-lg:text-6xl ds-font-bold ds-mb-4 cx-hero__title">
            {dict.hero.title}
          </h1>
          <p className="ds-text-lg ds-md:text-xl ds-mb-8 cx-hero__subtitle" style={{ maxWidth: '36rem', marginInline: 'auto' }}>
            {dict.hero.subtitle}
          </p>
          <SearchBar />
        </div>
      </div>
    </section>
  )
}
