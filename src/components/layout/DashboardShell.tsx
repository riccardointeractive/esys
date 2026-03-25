'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { DashboardHeader } from './DashboardHeader'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="ds-admin ds-admin--expanded">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="ds-admin__main">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="ds-p-6">{children}</main>
      </div>
    </div>
  )
}
