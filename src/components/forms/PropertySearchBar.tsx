'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ChevronDown } from 'lucide-react'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import type { Definition } from '@/types/definition'

function defLabel(def: Definition, locale: string): string {
  switch (locale) {
    case 'en': return def.label_en || def.label_es
    case 'ru': return def.label_ru || def.label_es
    default: return def.label_es
  }
}

interface DropdownOption {
  value: string
  label: string
}

function FilterDropdown({
  options,
  placeholder,
  value,
  onChange,
}: {
  options: DropdownOption[]
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div className="ds-dropdown" ref={ref}>
      <button
        type="button"
        className="property-filter-dropdown__trigger property-filter-dropdown__trigger--lg"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? 'property-filter-dropdown__value' : 'property-filter-dropdown__placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} />
      </button>
      <div className={`ds-dropdown__menu ds-dropdown__menu--right ${open ? 'ds-dropdown__menu--open' : ''}`}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`ds-dropdown__item ${opt.value === value ? 'ds-dropdown__item--active' : ''}`}
            onClick={() => {
              onChange(opt.value)
              setOpen(false)
            }}
          >
            <span className="ds-dropdown__item-label">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

interface PropertySearchBarProps {
  typeDefinitions?: Definition[]
  bedroomDefinitions?: Definition[]
}

export function PropertySearchBar({ typeDefinitions, bedroomDefinitions }: PropertySearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const [type, setType] = useState(searchParams.get('type') ?? '')
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') ?? '')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const params = new URLSearchParams()

    const location = formData.get('location') as string
    if (location) params.set('location', location)
    if (type) params.set('type', type)
    if (bedrooms) params.set('bedrooms', bedrooms)

    router.push(`${routes.properties}?${params.toString()}`)
  }

  const typeOptions: DropdownOption[] = typeDefinitions
    ? typeDefinitions.map((d) => ({ value: d.key, label: defLabel(d, locale) }))
    : Object.entries(t.property.types).map(([key, label]) => ({ value: key, label: label as string }))

  const bedroomOptions: DropdownOption[] = bedroomDefinitions
    ? bedroomDefinitions.map((d) => ({ value: d.key, label: `${d.key}+` }))
    : [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n}+` }))

  return (
    <form onSubmit={handleSubmit} className="property-search-bar">
      <div className="property-search-bar__fields">
        <div className="property-search-bar__input-wrap">
          <input
            name="location"
            type="text"
            defaultValue={searchParams.get('location') ?? ''}
            placeholder={t.search.placeholder}
            className="ds-input ds-input--lg ds-w-full"
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
          />
        </div>
        <FilterDropdown
          options={typeOptions}
          placeholder={t.search.type}
          value={type}
          onChange={setType}
        />
        <FilterDropdown
          options={bedroomOptions}
          placeholder={t.search.bedrooms}
          value={bedrooms}
          onChange={setBedrooms}
        />
        <button type="submit" className="ds-btn ds-btn--primary ds-btn--lg property-search-bar__submit">
          <Search size={18} />
          {t.search.submit}
        </button>
      </div>
    </form>
  )
}
