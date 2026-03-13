import { createSessionStore } from '@digiko-npm/cms/session'
import { createRequestVerifier } from '@digiko-npm/cms/next'
import { AUTH_CONFIG } from '@/config/auth'

const sessionStore = createSessionStore({
  redisUrl: process.env.UPSTASH_REDIS_REST_URL!,
  redisToken: process.env.UPSTASH_REDIS_REST_TOKEN!,
  keyPrefix: 'esys:',
  sessionDuration: AUTH_CONFIG.sessionDurationMs,
})

/**
 * Verify admin session on API requests.
 * Checks cookie or Authorization header → validates against Redis.
 */
export const verifyAdminRequest = createRequestVerifier({
  cookieName: AUTH_CONFIG.sessionCookieName,
  getSession: (token) => sessionStore.getSession(token),
})

export { sessionStore }
