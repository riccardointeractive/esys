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

  /* User */
  userFavorites: (userId: string) => `${PREFIX}:favorites:${userId}` as const,
} as const
