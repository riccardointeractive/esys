/* ─── Supabase Table Names ─── */

export const TABLES = {
  properties: 'esys_properties',
  propertyImages: 'esys_property_images',
  propertyFeatures: 'esys_property_features',
  users: 'esys_users',
  favorites: 'esys_favorites',
  savedSearches: 'esys_saved_searches',
  alerts: 'esys_alerts',
  leads: 'esys_leads',
  contactMessages: 'esys_contact_messages',
  admins: 'esys_admins',
  media: 'esys_media',
  analytics: 'esys_analytics_events',
} as const

/* ─── Supabase Storage Buckets ─── */

export const BUCKETS = {
  properties: 'esys-property-images',
  media: 'esys-media',
  avatars: 'esys-avatars',
  documents: 'esys-documents',
} as const
