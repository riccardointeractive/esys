import { es } from './es'
import { en } from './en'
import { ru } from './ru'

export type Locale = 'es' | 'en' | 'ru'
export type Dictionary = typeof es

export const locales: Locale[] = ['es', 'en', 'ru']
export const defaultLocale: Locale = 'es'

const dictionaries: Record<Locale, Dictionary> = { es, en, ru }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale]
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
