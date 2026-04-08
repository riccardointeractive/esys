'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Heart, User, LogOut } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Logo } from '@/components/ui/Logo'
import { useDictionary, useLocale } from '@/components/providers/LocaleProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { localizedRoutes } from '@/config/i18n/routes'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const t = useDictionary()
  const locale = useLocale()
  const routes = localizedRoutes(locale)
  const { isAuthenticated, logout } = useAuth()
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
            <span className="ds-lg:hidden"><Logo height={14} /></span>
            <span className="ds-hidden ds-lg:block"><Logo height={18} /></span>
          </Link>

          {/* Desktop menu */}
          <div className="ds-nav__menu ds-hidden ds-lg:flex">
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

          {/* Actions — icons always visible, logout only on desktop */}
          <div className="ds-nav__actions">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link
              href={routes.accountFavorites}
              className="ds-nav__icon-btn"
              aria-label={t.nav.favorites}
            >
              <Heart size={18} />
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href={routes.account}
                  className="ds-nav__icon-btn"
                  aria-label={t.nav.myAccount}
                >
                  <User size={18} />
                </Link>
                <button
                  onClick={() => logout()}
                  className="ds-nav__icon-btn ds-hidden ds-lg:flex"
                  aria-label={t.auth.logout}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href={routes.login}
                className="ds-nav__icon-btn"
                aria-label={t.nav.login}
              >
                <User size={18} />
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ds-nav__icon-btn ds-lg:hidden"
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
          {isAuthenticated && (
            <button
              onClick={() => { logout(); setMobileOpen(false) }}
              className="ds-nav__link"
            >
              {t.auth.logout}
            </button>
          )}
        </div>
      </div>
    </>
  )
}
