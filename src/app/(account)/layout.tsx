import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AccountNav } from '@/components/layout/AccountNav'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="public-main">
        <div className="ds-container ds-py-8">
          <AccountNav />
          <div className="ds-mt-6">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  )
}
