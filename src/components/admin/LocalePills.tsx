'use client'

import { cn } from '@/lib/utils'

type FormLocale = 'es' | 'en' | 'ru'

const LOCALES: { key: FormLocale; label: string }[] = [
  { key: 'es', label: 'ES' },
  { key: 'en', label: 'EN' },
  { key: 'ru', label: 'RU' },
]

interface LocalePillsProps {
  value: FormLocale
  onChange: (locale: FormLocale) => void
}

export function LocalePills({ value, onChange }: LocalePillsProps) {
  return (
    <div className="vip-locale-pills">
      {LOCALES.map((locale) => (
        <button
          key={locale.key}
          type="button"
          onClick={() => onChange(locale.key)}
          className={cn(
            'vip-locale-pill',
            value === locale.key && 'vip-locale-pill--active'
          )}
        >
          {locale.label}
        </button>
      ))}
    </div>
  )
}
