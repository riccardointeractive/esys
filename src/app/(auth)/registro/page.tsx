import Link from 'next/link'
import { ROUTES } from '@/config/routes'

export default function RegisterPage() {
  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <h1>Crear Cuenta</h1>
      </div>
      <div className="ds-card__body">
        <form className="ds-space-y-4">
          <div className="ds-form-group">
            <label className="ds-label">Nombre</label>
            <input type="text" className="ds-input ds-w-full" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Email</label>
            <input type="email" className="ds-input ds-w-full" placeholder="tu@email.com" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Contraseña</label>
            <input type="password" className="ds-input ds-w-full" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Confirmar Contraseña</label>
            <input type="password" className="ds-input ds-w-full" />
          </div>
          <button type="submit" className="ds-btn ds-btn--full ds-btn--lg">
            Registrarse
          </button>
        </form>
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          ¿Ya tienes cuenta?{' '}
          <Link href={ROUTES.login} className="ds-text-interactive">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
