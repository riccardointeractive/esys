/* ─── Supabase Table Names ─── */

export const TABLES = {
  properties: 'properties',
  propertyImages: 'property_images',
  propertyFeatures: 'property_features',
  users: 'users',
  favorites: 'favorites',
  savedSearches: 'saved_searches',
  alerts: 'alerts',
  leads: 'leads',
  contactMessages: 'contact_messages',
  admins: 'admins',
  media: 'media',
  analytics: 'analytics_events',
} as const

/* ─── Supabase Storage Buckets ─── */

export const BUCKETS = {
  properties: 'property-images',
  media: 'media',
  avatars: 'avatars',
  documents: 'documents',
} as const
