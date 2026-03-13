import { es } from './es'
import { en } from './en'

export type Locale = 'es' | 'en'
export type Dictionary = typeof es

export const locales: Locale[] = ['es', 'en']
export const defaultLocale: Locale = 'es'

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
