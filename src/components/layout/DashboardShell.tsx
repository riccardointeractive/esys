'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { DashboardHeader } from './DashboardHeader'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="ds-min-h-screen ds-bg-base">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-offset">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="ds-p-6">{children}</main>
      </div>
    </div>
  )
}
