'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown } from 'lucide-react'
import { BEDROOMS_OPTIONS } from '@/config/property'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'

interface DropdownOption {
  value: string
  label: string
}

function SearchDropdown({
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
        className="cx-search-dropdown__trigger"
        onClick={() => setOpen(!open)}
      >
        <span className={selected ? 'cx-search-dropdown__value' : 'cx-search-dropdown__placeholder'}>
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

export function SearchBar() {
  const router = useRouter()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const [type, setType] = useState('')
  const [bedrooms, setBedrooms] = useState('')

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

  const typeOptions: DropdownOption[] = Object.entries(t.property.types).map(([key, label]) => ({
    value: key,
    label: label as string,
  }))

  const bedroomOptions: DropdownOption[] = BEDROOMS_OPTIONS.map((n) => ({
    value: String(n),
    label: `${n}+`,
  }))

  return (
    <form onSubmit={handleSubmit} className="cx-hero-search">
      <div className="ds-flex ds-flex-col ds-md:flex-row ds-md:items-stretch ds-gap-3">
        <div className="ds-flex-1">
          <input
            name="location"
            type="text"
            placeholder={t.search.placeholder}
            className="ds-input ds-w-full"
          />
        </div>
        <SearchDropdown
          options={typeOptions}
          placeholder={t.search.type}
          value={type}
          onChange={setType}
        />
        <SearchDropdown
          options={bedroomOptions}
          placeholder={t.search.bedrooms}
          value={bedrooms}
          onChange={setBedrooms}
        />
      </div>
      <button type="submit" className="ds-btn cx-hero-search__submit ds-w-full ds-flex ds-items-center ds-justify-center ds-gap-2 ds-mt-3">
        <Search size={18} />
        {t.search.submit}
      </button>
    </form>
  )
}
