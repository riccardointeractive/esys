'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Heart, Settings } from 'lucide-react'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  User, Heart, Settings,
}

export function AccountNav() {
  const pathname = usePathname()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)

  const items = [
    { label: t.account.myAccount, href: routes.account, icon: 'User' },
    { label: t.account.favorites, href: routes.accountFavorites, icon: 'Heart' },
    { label: t.account.settings, href: routes.accountSettings, icon: 'Settings' },
  ]

  return (
    <nav className="account-nav-scroll">
      <div className="ds-tabs">
        {items.map((item) => {
          const Icon = iconMap[item.icon] ?? User
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('ds-tab', isActive && 'ds-tab--active')}
            >
              <span className="ds-tab__icon"><Icon size={16} /></span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
