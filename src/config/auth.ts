/* ─── Authentication Configuration ─── */

export const AUTH_CONFIG = {
  /* Session */
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000,  // 7 days
  sessionCookieName: 'esys-session',

  /* Password */
  pbkdf2Iterations: 100_000,
  pbkdf2KeyLength: 64,
  pbkdf2Digest: 'sha512',
  minPasswordLength: 8,

  /* Rate Limiting */
  loginMaxAttempts: 5,
  loginWindowMs: 15 * 60 * 1000,  // 15 minutes
  contactMaxAttempts: 3,
  contactWindowMs: 60 * 60 * 1000,  // 1 hour
  registerMaxAttempts: 3,
  registerWindowMs: 60 * 60 * 1000,  // 1 hour

  /* Roles */
  roles: {
    user: 'user',
    admin: 'admin',
    superAdmin: 'super_admin',
  },
} as const
