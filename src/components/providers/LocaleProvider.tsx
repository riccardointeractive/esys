'use client'

import { createContext, useContext } from 'react'
import type { Locale, Dictionary } from '@/config/i18n'

interface LocaleContextValue {
  locale: Locale
  t: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale
  dictionary: Dictionary
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: dictionary }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): Locale {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx.locale
}

export function useDictionary(): Dictionary {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useDictionary must be used within LocaleProvider')
  return ctx.t
}
