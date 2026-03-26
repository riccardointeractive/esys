'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  UserPlus,
  Users,
  Image,
  BarChart3,
  ListChecks,
  Settings,
} from 'lucide-react'
import {
  AdminLayout,
  AdminSidebar,
  AdminHeader,
  type NavItem,
} from '@digiko-npm/ds-admin'
import { siteConfig } from '@/config/site'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Building2: <Building2 size={18} />,
  UserPlus: <UserPlus size={18} />,
  Users: <Users size={18} />,
  Image: <Image size={18} />,
  ListChecks: <ListChecks size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Settings: <Settings size={18} />,
}

const navItems: NavItem[] = siteConfig.adminNav.map((item) => ({
  id: item.href,
  label: item.label,
  href: item.href,
  icon: iconMap[item.icon] ?? <LayoutDashboard size={18} />,
  disabled: 'disabled' in item && item.disabled ? true : undefined,
  badge:
    'disabled' in item && item.disabled ? (
      <span
        className="ds-badge ds-badge--outline"
        style={{ fontSize: '0.6rem' }}
      >
        SOON
      </span>
    ) : undefined,
}))

const sidebarHeader = (
  <Link href="/" className="ds-text-primary">
    <Logo height={16} />
  </Link>
)

const sidebarFooter = (
  <p className="ds-text-xs ds-text-tertiary">Built with Digiko DS</p>
)

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout
      collapsible={false}
      sidebar={
        <AdminSidebar
          items={navItems}
          header={sidebarHeader}
          footer={sidebarFooter}
        />
      }
      header={
        <AdminHeader
          left={
            <h1 className="ds-font-display ds-text-lg ds-text-primary">
              Dashboard
            </h1>
          }
          right={
            <>
              <ThemeToggle />
              <div className="ds-flex ds-h-8 ds-w-8 ds-items-center ds-justify-center ds-rounded-full ds-bg-inverted ds-text-on-inverted ds-text-sm ds-font-medium">
                U
              </div>
            </>
          }
        />
      }
    >
      {children}
    </AdminLayout>
  )
}
