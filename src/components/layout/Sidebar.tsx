'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay ds-lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'sidebar',
          open && 'sidebar--open'
        )}
      >
        {/* Brand */}
        <div className="ds-flex ds-h-16 ds-items-center ds-justify-between ds-border-b ds-px-6">
          <Link href="/" className="font-display ds-text-lg ds-text-primary">
            {siteConfig.name}
          </Link>
          <button
            onClick={onClose}
            className="ds-btn ds-btn--ghost ds-btn--icon ds-lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="ds-flex-1 ds-overflow-y-auto ds-px-3 ds-py-4">
          <ul className="ds-space-y-1">
            {siteConfig.nav.map((item) => {
              const Icon = iconMap[item.icon] ?? LayoutDashboard
              const isActive = pathname === item.href

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'nav-item',
                      isActive && 'nav-item--active'
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="ds-border-t ds-px-6 ds-py-4">
          <p className="ds-text-xs ds-text-tertiary">
            Built with Digiko DS
          </p>
        </div>
      </aside>
    </>
  )
}
