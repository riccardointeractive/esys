import { notFound } from 'next/navigation'
import { isValidLocale, getDictionary, locales } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { LocaleProvider } from '@/components/providers/LocaleProvider'

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

interface LangLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = await params

  if (!isValidLocale(lang)) {
    notFound()
  }

  const dictionary = getDictionary(lang as Locale)

  return (
    <LocaleProvider locale={lang as Locale} dictionary={dictionary}>
      {children}
    </LocaleProvider>
  )
}
