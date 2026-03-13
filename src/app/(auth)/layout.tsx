import Link from 'next/link'
import { ROUTES } from '@/config/routes'
import { siteConfig } from '@/config/site'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="ds-min-h-screen ds-flex ds-flex-col ds-items-center ds-justify-center ds-bg-base ds-px-4">
      <Link
        href={ROUTES.home}
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
