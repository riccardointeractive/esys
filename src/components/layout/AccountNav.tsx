'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Heart, Search, Bell, Settings } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ElementType> = {
  User,
  Heart,
  Search,
  Bell,
  Settings,
}

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="account-nav-scroll">
      <div className="ds-tabs">
        {siteConfig.accountNav.map((item) => {
          const Icon = iconMap[item.icon] ?? User
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('ds-tab', isActive && 'ds-tab--active')}
            >
              <span className="ds-tab__icon">
                <Icon size={16} />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
