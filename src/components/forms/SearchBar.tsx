'use client'

import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { PROPERTY_TYPES, BEDROOMS_OPTIONS } from '@/config/property'
import { ROUTES } from '@/config/routes'

export function SearchBar() {
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    for (const [key, value] of formData.entries()) {
      if (value) params.set(key, value as string)
    }

    router.push(`${ROUTES.properties}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="cx-search-bar ds-mx-auto" style={{ maxWidth: '48rem' }}>
      <div className="ds-flex ds-flex-col ds-md:flex-row ds-gap-3">
        <div className="ds-flex-1">
          <input
            name="location"
            type="text"
            placeholder="Ciudad, zona o dirección..."
            className="ds-input ds-w-full"
          />
        </div>
        <div>
          <select name="type" className="ds-select ds-w-full" defaultValue="">
            <option value="">Tipo</option>
            {Object.entries(PROPERTY_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select name="bedrooms" className="ds-select ds-w-full" defaultValue="">
            <option value="">Habitaciones</option>
            {BEDROOMS_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="ds-btn ds-btn--lg ds-flex ds-items-center ds-gap-2">
          <Search size={18} />
          <span className="ds-hidden ds-md:inline">Buscar</span>
        </button>
      </div>
    </form>
  )
}
