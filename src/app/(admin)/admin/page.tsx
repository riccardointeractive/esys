import { Building2, Users, UserPlus, BarChart3 } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="ds-grid ds-grid-cols-1 ds-sm:grid-cols-2 ds-lg:grid-cols-4 ds-gap-4 ds-mb-8">
        <div className="ds-stat-card">
          <div className="ds-stat-card__icon">
            <Building2 size={20} />
          </div>
          <p className="ds-stat-card__label">Propiedades</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card__icon">
            <UserPlus size={20} />
          </div>
          <p className="ds-stat-card__label">Leads</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card__icon">
            <Users size={20} />
          </div>
          <p className="ds-stat-card__label">Usuarios</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <div className="ds-stat-card__icon">
            <BarChart3 size={20} />
          </div>
          <p className="ds-stat-card__label">Visitas hoy</p>
          <p className="ds-stat-card__value">0</p>
        </div>
      </div>

      {/* Recent leads */}
      <div className="ds-card">
        <div className="ds-card__header">
          <h2>Últimos Leads</h2>
        </div>
        <div className="ds-card__body ds-text-center ds-py-8">
          <p className="ds-text-secondary">No hay leads recientes.</p>
        </div>
      </div>
    </div>
  )
}
