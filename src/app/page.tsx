import { DashboardShell } from '@/components/layout/DashboardShell'
import { TrendingUp, Users, FolderKanban, Activity } from 'lucide-react'

const stats = [
  { label: 'Total Revenue', value: '$45,231', detail: '+20.1% from last month', icon: TrendingUp },
  { label: 'Active Users', value: '2,350', detail: '+180 this week', icon: Users },
  { label: 'Projects', value: '12', detail: '3 in progress', icon: FolderKanban },
  { label: 'Uptime', value: '99.9%', detail: 'Last 30 days', icon: Activity },
]

const recentActivity = [
  { id: 1, action: 'New deployment', project: 'Website Redesign', status: 'success', time: '2 min ago' },
  { id: 2, action: 'Build failed', project: 'Mobile App', status: 'error', time: '15 min ago' },
  { id: 3, action: 'New member added', project: 'API Gateway', status: 'info', time: '1 hour ago' },
  { id: 4, action: 'Release published', project: 'Design System', status: 'success', time: '3 hours ago' },
  { id: 5, action: 'Issue reported', project: 'Auth Service', status: 'warning', time: '5 hours ago' },
]

const statusBadge: Record<string, string> = {
  success: 'ds-badge ds-badge--success',
  error: 'ds-badge ds-badge--error',
  warning: 'ds-badge ds-badge--warning',
  info: 'ds-badge ds-badge--info',
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      {/* Page title */}
      <div className="ds-mb-8">
        <h2 className="font-display ds-text-2xl ds-text-primary">Overview</h2>
        <p className="ds-mt-1 ds-text-sm ds-text-secondary">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stat cards */}
      <div className="ds-grid ds-grid-cols-1 ds-gap-4 ds-sm:grid-cols-2 ds-lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="ds-card ds-card__body">
            <div className="ds-flex ds-items-center ds-justify-between">
              <p className="ds-text-sm ds-text-secondary">{stat.label}</p>
              <stat.icon size={18} className="ds-text-tertiary" />
            </div>
            <p className="ds-mt-2 font-display ds-text-2xl ds-text-primary">{stat.value}</p>
            <p className="ds-mt-1 ds-text-xs ds-text-tertiary">{stat.detail}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="ds-mt-8 ds-grid ds-grid-cols-1 ds-gap-6 ds-lg:grid-cols-3">
        {/* Activity table */}
        <div className="ds-lg:col-span-2">
          <div className="ds-card">
            <div className="ds-card__header">
              <h3 className="ds-card__title">Recent Activity</h3>
            </div>
            <div className="ds-card__body ds-p-0">
              <div className="ds-table-wrapper">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Project</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.map((item) => (
                      <tr key={item.id}>
                        <td>{item.action}</td>
                        <td className="ds-text-secondary">{item.project}</td>
                        <td>
                          <span className={statusBadge[item.status]}>
                            {item.status}
                          </span>
                        </td>
                        <td className="ds-text-tertiary">{item.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="ds-card">
          <div className="ds-card__header">
            <h3 className="ds-card__title">Quick Actions</h3>
          </div>
          <div className="ds-card__body ds-space-y-3">
            <button className="ds-btn ds-btn--full">New Project</button>
            <button className="ds-btn ds-btn--secondary ds-btn--full">Invite Member</button>
            <button className="ds-btn ds-btn--outline ds-btn--full">View Reports</button>
            <button className="ds-btn ds-btn--ghost ds-btn--full">Settings</button>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
