'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Heart, User } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { label: t.nav.home, href: routes.home },
    { label: t.nav.properties, href: routes.properties },
    { label: t.nav.newBuilds, href: routes.newBuilds },
    { label: t.nav.resale, href: routes.resale },
    { label: t.nav.about, href: routes.about },
    { label: t.nav.contact, href: routes.contact },
  ]

  return (
    <>
      <nav className="ds-nav">
        <div className="ds-nav__inner">
          <Link href={routes.home} className="ds-nav__brand">
            {siteConfig.name}
          </Link>

          {/* Desktop menu */}
          <div className="ds-nav__menu ds-hidden ds-md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'ds-nav__link',
                  pathname === item.href && 'ds-nav__link--active'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="ds-nav__actions">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href={routes.favorites}
              className="ds-nav__icon-btn ds-hidden ds-md:flex"
              aria-label={t.nav.favorites}
            >
              <Heart size={18} />
            </Link>
            <Link
              href={routes.login}
              className="ds-nav__icon-btn ds-hidden ds-md:flex"
              aria-label={t.nav.myAccount}
            >
              <User size={18} />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ds-nav__icon-btn ds-md:hidden"
              aria-label={t.nav.menu}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={cn('ds-nav__mobile', mobileOpen && 'ds-nav__mobile--open')}>
        <div className="ds-nav__mobile-links">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'ds-nav__link',
                pathname === item.href && 'ds-nav__link--active'
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={routes.favorites}
            onClick={() => setMobileOpen(false)}
            className="ds-nav__link"
          >
            {t.nav.favorites}
          </Link>
          <Link
            href={routes.login}
            onClick={() => setMobileOpen(false)}
            className="ds-nav__link"
          >
            {t.nav.login}
          </Link>
        </div>
      </div>
    </>
  )
}
