'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Heart, User } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { ROUTES } from '@/config/routes'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="ds-nav">
        <div className="ds-nav__inner">
          <Link href={ROUTES.home} className="ds-nav__brand">
            {siteConfig.name}
          </Link>

          {/* Desktop menu */}
          <div className="ds-nav__menu ds-hidden ds-md:flex">
            {siteConfig.nav.map((item) => (
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
            <ThemeToggle />
            <Link
              href={ROUTES.favorites}
              className="ds-nav__icon-btn ds-hidden ds-md:flex"
              aria-label="Favoritos"
            >
              <Heart size={18} />
            </Link>
            <Link
              href={ROUTES.login}
              className="ds-nav__icon-btn ds-hidden ds-md:flex"
              aria-label="Mi cuenta"
            >
              <User size={18} />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ds-nav__icon-btn ds-md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={cn('ds-nav__mobile', mobileOpen && 'ds-nav__mobile--open')}>
        <div className="ds-nav__mobile-links">
          {siteConfig.nav.map((item) => (
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
            href={ROUTES.favorites}
            onClick={() => setMobileOpen(false)}
            className="ds-nav__link"
          >
            Favoritos
          </Link>
          <Link
            href={ROUTES.login}
            onClick={() => setMobileOpen(false)}
            className="ds-nav__link"
          >
            Acceder
          </Link>
        </div>
      </div>
    </>
  )
}
