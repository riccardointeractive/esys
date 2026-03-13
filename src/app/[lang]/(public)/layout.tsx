import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface PublicLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function PublicLayout({ children, params }: PublicLayoutProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <>
      <Navbar />
      <main className="public-main">{children}</main>
      <Footer lang={lang as Locale} dict={dict} />
    </>
  )
}
