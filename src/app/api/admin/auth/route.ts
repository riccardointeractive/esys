import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, generateSessionToken } from '@digiko-npm/cms/auth'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { sessionStore } from '@/lib/admin-auth'
import { AUTH_CONFIG } from '@/config/auth'

/* ─── POST /api/admin/auth — Admin Login ─── */

export async function POST(request: NextRequest) {
  let body: { password: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.password) {
    return NextResponse.json(
      { error: 'Se requiere contraseña' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const storedHash = process.env.ADMIN_PASSWORD_HASH
  const salt = process.env.ADMIN_PASSWORD_SALT

  if (!storedHash || !salt) {
    return NextResponse.json(
      { error: 'Configuración de admin no disponible' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }

  const valid = verifyPassword(body.password, salt, storedHash, {
    iterations: AUTH_CONFIG.pbkdf2Iterations,
    keyLength: AUTH_CONFIG.pbkdf2KeyLength,
    digest: AUTH_CONFIG.pbkdf2Digest,
  })

  if (!valid) {
    return NextResponse.json(
      { error: 'Contraseña incorrecta' },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  // Create session
  const token = generateSessionToken()
  const now = Date.now()

  await sessionStore.addSession(token, {
    createdAt: now,
    expiresAt: now + AUTH_CONFIG.sessionDurationMs,
  })

  // Set cookie
  const response = NextResponse.json({ success: true })
  response.cookies.set(AUTH_CONFIG.sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_CONFIG.sessionDurationMs / 1000,
  })

  return response
}
