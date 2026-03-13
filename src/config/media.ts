/* ─── Media / Cloudflare R2 Configuration ─── */

export const MEDIA_CONFIG = {
  /* Image Limits */
  maxPropertyImages: 30,
  maxFileSizeMb: 10,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
  maxVideoSizeMb: 100,

  /* Thumbnail Generation */
  thumbnailWidth: 400,
  thumbnailHeight: 300,
  thumbnailQuality: 80,

  /* Gallery */
  galleryBreakpoints: {
    sm: 1,
    md: 2,
    lg: 3,
  },

  /* R2 Paths */
  paths: {
    properties: 'properties',
    avatars: 'avatars',
    general: 'media',
  },
} as const
