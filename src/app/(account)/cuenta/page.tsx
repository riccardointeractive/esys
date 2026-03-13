export default function AccountPage() {
  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        Mi Cuenta
      </h1>
      <div className="ds-grid ds-grid-cols-1 ds-md:grid-cols-3 ds-gap-6">
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">Favoritos</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">Búsquedas guardadas</p>
          <p className="ds-stat-card__value">0</p>
        </div>
        <div className="ds-stat-card">
          <p className="ds-stat-card__label">Alertas activas</p>
          <p className="ds-stat-card__value">0</p>
        </div>
      </div>
    </div>
  )
}
