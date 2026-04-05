/* ─── Redis Key Patterns ─── */

const PREFIX = 'esys'

export const REDIS_KEYS = {
  /* Sessions */
  session: (token: string) => `${PREFIX}:session:${token}` as const,
  userSession: (userId: string) => `${PREFIX}:user-session:${userId}` as const,

  /* Properties */
  propertyCache: (id: string) => `${PREFIX}:property:${id}` as const,
  propertyList: (page: number) => `${PREFIX}:properties:page:${page}` as const,
  featuredProperties: `${PREFIX}:properties:featured` as const,
  propertyCount: `${PREFIX}:properties:count` as const,

  /* Search */
  searchResults: (hash: string) => `${PREFIX}:search:${hash}` as const,

  /* Rate Limiting */
  rateLimit: (ip: string) => `${PREFIX}:rate:${ip}` as const,
  contactRateLimit: (ip: string) => `${PREFIX}:rate:contact:${ip}` as const,

  /* Analytics */
  pageViews: (slug: string) => `${PREFIX}:views:${slug}` as const,
  dailyVisits: (date: string) => `${PREFIX}:visits:${date}` as const,

  /* User Sessions */
  userSessionByToken: (token: string) => `${PREFIX}:user-session:${token}` as const,

  /* User */
  userFavorites: (userId: string) => `${PREFIX}:favorites:${userId}` as const,

  /* Rate Limiting — Reset Password */
  resetRateLimit: (ip: string) => `${PREFIX}:rate:reset:${ip}` as const,
} as const

/* ─── Key prefixes for CMS createRateLimiter ───
   CMS's createRateLimiter appends its own `ratelimit:<key>` suffix to the
   prefix, so these live separately from REDIS_KEYS (which holds full key
   builders used for direct Redis access). */
export const REDIS_KEY_PREFIXES = {
  /** Used by /api/contact via @digiko-npm/cms createRateLimiter. */
  contact: `${PREFIX}:contact:` as const,
} as const
