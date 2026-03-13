'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { BEDROOMS_OPTIONS } from '@/config/property'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'

export function SearchBar() {
  const router = useRouter()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    for (const [key, value] of formData.entries()) {
      if (value) params.set(key, value as string)
    }

    router.push(`${routes.properties}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="cx-search-bar ds-mx-auto" style={{ maxWidth: '48rem' }}>
      <div className="ds-flex ds-flex-col ds-md:flex-row ds-gap-3">
        <div className="ds-flex-1">
          <input
            name="location"
            type="text"
            placeholder={t.search.placeholder}
            className="ds-input ds-w-full"
          />
        </div>
        <div>
          <select name="type" className="ds-select ds-w-full" defaultValue="">
            <option value="">{t.search.type}</option>
            {Object.entries(t.property.types).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select name="bedrooms" className="ds-select ds-w-full" defaultValue="">
            <option value="">{t.search.bedrooms}</option>
            {BEDROOMS_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="ds-btn ds-btn--lg ds-flex ds-items-center ds-gap-2">
          <Search size={18} />
          <span className="ds-hidden ds-md:inline">{t.search.submit}</span>
        </button>
      </div>
    </form>
  )
}
