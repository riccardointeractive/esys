'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { translatePathname } from '@/config/i18n/routes'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const targetLocale = locale === 'es' ? 'en' : 'es'
  const targetPath = translatePathname(pathname, locale, targetLocale)

  return (
    <Link
      href={targetPath}
      className={cn('ds-nav__icon-btn ds-text-xs ds-font-semibold')}
      aria-label={`Switch to ${targetLocale === 'en' ? 'English' : 'Español'}`}
    >
      {targetLocale.toUpperCase()}
    </Link>
  )
}
