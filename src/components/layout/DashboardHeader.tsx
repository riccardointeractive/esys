'use client'

import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="dashboard-header ds-flex ds-h-16 ds-items-center ds-justify-between ds-px-6">
      <div className="ds-flex ds-items-center ds-gap-3">
        <button
          onClick={onMenuClick}
          className="ds-btn ds-btn--ghost ds-btn--icon ds-lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-display ds-text-lg ds-text-primary">Dashboard</h1>
      </div>

      <div className="ds-flex ds-items-center ds-gap-2">
        <ThemeToggle />
        <div className="ds-flex ds-h-8 ds-w-8 ds-items-center ds-justify-center ds-rounded-full ds-bg-inverted ds-text-on-inverted ds-text-sm ds-font-medium">
          U
        </div>
      </div>
    </header>
  )
}
