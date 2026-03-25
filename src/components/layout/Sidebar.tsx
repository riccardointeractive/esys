'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Image,
  BarChart3,
  ListChecks,
  Settings,
  X,
} from 'lucide-react'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Image,
  ListChecks,
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
          className="ds-admin__overlay ds-lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className="ds-admin__sidebar"
        style={open ? { display: 'flex' } : undefined}
      >
        {/* Brand */}
        <div className="ds-flex ds-h-16 ds-items-center ds-justify-between ds-border-b ds-px-6">
          <Link href="/" className="ds-text-primary">
            <Logo height={16} />
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
            {siteConfig.adminNav.map((item) => {
              const Icon = iconMap[item.icon] ?? LayoutDashboard
              const isActive = pathname === item.href
              const isDisabled = 'disabled' in item && item.disabled

              return (
                <li key={item.href}>
                  {isDisabled ? (
                    <span
                      className="ds-admin__nav-item"
                      style={{ cursor: 'default', pointerEvents: 'none', color: 'var(--ds-color-text-tertiary)' }}
                    >
                      <Icon size={18} />
                      {item.label}
                      <span className="ds-badge ds-badge--outline ds-ml-auto" style={{ fontSize: '0.6rem' }}>
                        SOON
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'ds-admin__nav-item',
                        isActive && 'ds-admin__nav-item--active'
                      )}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  )}
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
