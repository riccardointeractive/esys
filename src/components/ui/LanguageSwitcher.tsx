'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { translatePathname } from '@/config/i18n/routes'
import { locales, type Locale } from '@/config/i18n'
import { cn } from '@/lib/utils'

const LOCALE_LABELS: Record<Locale, { flag: string; name: string }> = {
  es: { flag: 'ES', name: 'Español' },
  en: { flag: 'EN', name: 'English' },
  ru: { flag: 'RU', name: 'Русский' },
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const otherLocales = locales.filter((l) => l !== locale)

  return (
    <div ref={ref} className="cx-lang-switcher">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn('ds-nav__icon-btn ds-text-xs ds-font-semibold cx-lang-switcher__trigger')}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language: ${LOCALE_LABELS[locale].name}`}
      >
        {LOCALE_LABELS[locale].flag}
      </button>

      {open && (
        <div className="cx-lang-switcher__dropdown" role="listbox">
          {otherLocales.map((l) => (
            <Link
              key={l}
              href={translatePathname(pathname, locale, l)}
              className="cx-lang-switcher__option"
              role="option"
              aria-selected={false}
              onClick={() => setOpen(false)}
            >
              <span className="cx-lang-switcher__flag">{LOCALE_LABELS[l].flag}</span>
              <span className="cx-lang-switcher__name">{LOCALE_LABELS[l].name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
