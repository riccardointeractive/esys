import { SearchBar } from '@/components/forms/SearchBar'
import type { Dictionary } from '@/config/i18n'
import type { Definition } from '@/types/definition'

// Alicante — sunset with palm trees (Unsplash: Pe_SJm0aHqs)
const HERO_IMAGE = 'https://images.unsplash.com/photo-1680537732160-01750bae5217?w=1920&h=1080&fit=crop&q=80'

interface HeroProps {
  dict: Dictionary
  typeDefinitions?: Definition[]
  bedroomDefinitions?: Definition[]
}

export function Hero({ dict, typeDefinitions, bedroomDefinitions }: HeroProps) {
  return (
    <section
      className="ds-hero ds-hero--full"
      style={{
        backgroundImage: `url(${HERO_IMAGE})`,
      }}
    >
      <div className="ds-hero__content ds-container ds-py-16 ds-md:py-24">
        <div className="ds-hero__backdrop">
          <h1 className="ds-font-display ds-text-4xl ds-md:text-5xl ds-lg:text-6xl ds-font-bold ds-mb-4 ds-hero__title ds-text-always-white">
            {dict.hero.title}
          </h1>
          <p className="ds-text-lg ds-md:text-xl ds-mb-8 ds-hero__subtitle ds-text-always-white ds-opacity-75" style={{ maxWidth: '36rem', marginInline: 'auto' }}>
            {dict.hero.subtitle}
          </p>
          <SearchBar typeDefinitions={typeDefinitions} bedroomDefinitions={bedroomDefinitions} />
        </div>
      </div>
    </section>
  )
}
