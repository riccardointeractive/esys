import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { localizedRoutes } from '@/config/i18n/routes'
import type { Locale } from '@/config/i18n'

interface AuthLayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { lang } = await params
  const routes = localizedRoutes(lang as Locale)

  return (
    <div className="ds-min-h-screen ds-flex ds-flex-col ds-items-center ds-justify-center ds-bg-base ds-px-4">
      <Link
        href={routes.home}
        className="font-display ds-text-2xl ds-text-primary ds-mb-8"
      >
        {siteConfig.name}
      </Link>
      <div className="ds-w-full" style={{ maxWidth: '24rem' }}>
        {children}
      </div>
    </div>
  )
}
