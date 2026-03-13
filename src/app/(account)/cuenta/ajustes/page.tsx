export default function SettingsPage() {
  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        Ajustes
      </h1>
      <div className="ds-card">
        <div className="ds-card__body">
          <form className="ds-space-y-4">
            <div className="ds-form-group">
              <label className="ds-label">Nombre</label>
              <input type="text" className="ds-input ds-w-full" />
            </div>
            <div className="ds-form-group">
              <label className="ds-label">Email</label>
              <input type="email" className="ds-input ds-w-full" />
            </div>
            <button type="submit" className="ds-btn">
              Guardar cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
