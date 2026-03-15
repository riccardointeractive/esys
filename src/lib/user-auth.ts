import { createSessionStore } from '@digiko-npm/cms/session'
import { generateSessionToken } from '@digiko-npm/cms/auth'
import { AUTH_CONFIG } from '@/config/auth'
import type { UserSession } from '@/types/user'

/* ─── User Session Store (Redis-backed) ─── */

const userSessionStore = createSessionStore({
  redisUrl: process.env.UPSTASH_REDIS_REST_URL!,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
  keyPrefix: 'esys:user:',
  sessionDuration: AUTH_CONFIG.userSessionDurationMs,
})

/* ─── Create a user session ─── */

export async function createUserSession(user: {
  id: string
  email: string
  username: string
  full_name: string
}): Promise<string> {
  const token = generateSessionToken()
  const now = Date.now()

  const sessionData: UserSession = {
    userId: user.id,
    email: user.email,
    username: user.username,
    fullName: user.full_name,
    createdAt: now,
    expiresAt: now + AUTH_CONFIG.userSessionDurationMs,
  }

  await userSessionStore.addSession(token, sessionData as never)
  return token
}

/* ─── Verify user session from request ─── */

export async function verifyUserSession(
  request: Request
): Promise<UserSession | null> {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=')
      return [key, rest.join('=')]
    })
  )

  const token = cookies[AUTH_CONFIG.userSessionCookieName]
  if (!token) return null

  const session = await userSessionStore.getSession(token)
  if (!session) return null

  const data = session as unknown as UserSession
  if (data.expiresAt < Date.now()) {
    await userSessionStore.removeSession(token)
    return null
  }

  return data
}

/* ─── Delete user session ─── */

export async function deleteUserSession(token: string): Promise<void> {
  await userSessionStore.removeSession(token)
}

/* ─── Get session token from request cookies ─── */

export function getSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=')
      return [key, rest.join('=')]
    })
  )

  return cookies[AUTH_CONFIG.userSessionCookieName] || null
}

export { userSessionStore }
