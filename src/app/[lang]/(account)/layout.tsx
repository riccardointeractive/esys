import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AccountNav } from '@/components/layout/AccountNav'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'

interface AccountLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AccountLayout({ children, params }: AccountLayoutProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)

  return (
    <>
      <Navbar />
      <main className="public-main">
        <div className="ds-container ds-py-8">
          <AccountNav />
          <div className="ds-mt-6">{children}</div>
        </div>
      </main>
      <Footer lang={lang as Locale} dict={dict} />
    </>
  )
}
