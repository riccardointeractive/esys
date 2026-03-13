import Link from 'next/link'
import { ROUTES } from '@/config/routes'

export default function LoginPage() {
  return (
    <div className="ds-card">
      <div className="ds-card__header">
        <h1>Iniciar Sesión</h1>
      </div>
      <div className="ds-card__body">
        <form className="ds-space-y-4">
          <div className="ds-form-group">
            <label className="ds-label">Email</label>
            <input type="email" className="ds-input ds-w-full" placeholder="tu@email.com" />
          </div>
          <div className="ds-form-group">
            <label className="ds-label">Contraseña</label>
            <input type="password" className="ds-input ds-w-full" />
          </div>
          <button type="submit" className="ds-btn ds-btn--full ds-btn--lg">
            Entrar
          </button>
        </form>
      </div>
      <div className="ds-card__footer ds-text-center">
        <p className="ds-text-sm ds-text-secondary">
          ¿No tienes cuenta?{' '}
          <Link href={ROUTES.register} className="ds-text-interactive">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
