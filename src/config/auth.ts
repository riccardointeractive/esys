/* ─── Authentication Configuration ─── */

export const AUTH_CONFIG = {
  /* Admin Session */
  sessionDurationMs: 7 * 24 * 60 * 60 * 1000,  // 7 days
  sessionCookieName: 'esys-session',

  /* User Session */
  userSessionCookieName: 'esys-user-session',
  userSessionDurationMs: 7 * 24 * 60 * 60 * 1000,  // 7 days

  /* Password */
  pbkdf2Iterations: 100_000,
  pbkdf2KeyLength: 64,
  pbkdf2Digest: 'sha512',
  minPasswordLength: 8,

  /* Username */
  minUsernameLength: 3,
  maxUsernameLength: 30,

  /* Password Reset */
  resetTokenExpiryMs: 60 * 60 * 1000,  // 1 hour

  /* 2FA / TOTP */
  totpIssuer: 'ESYS VIP',
  totpAlgorithm: 'SHA1' as const,
  totpDigits: 6,
  totpPeriod: 30,

  /* Rate Limiting */
  loginMaxAttempts: 5,
  loginWindowMs: 15 * 60 * 1000,  // 15 minutes
  contactMaxAttempts: 3,
  contactWindowMs: 60 * 60 * 1000,  // 1 hour
  registerMaxAttempts: 3,
  registerWindowMs: 60 * 60 * 1000,  // 1 hour
  resetMaxAttempts: 3,
  resetWindowMs: 60 * 60 * 1000,  // 1 hour

  /* Roles */
  roles: {
    user: 'user',
    admin: 'admin',
    superAdmin: 'super_admin',
  },
} as const
