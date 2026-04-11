/* ─── Public Routes ─── */
export const ROUTES = {
  home: '/',
  properties: '/propiedades',
  propertyDetail: '/propiedades/[slug]',
  newBuilds: '/obra-nueva',
  resale: '/segunda-mano',
  about: '/nosotros',
  contact: '/contacto',
  login: '/login',
  register: '/registro',
  resetPassword: '/reset-password',
  favorites: '/favoritos',
  search: '/buscar',
  blog: '/blog',
  blogPost: '/blog/[slug]',
  blogCategory: '/blog/categoria/[slug]',
} as const

/* ─── Dashboard (registered users) ─── */
export const USER_ROUTES = {
  dashboard: '/cuenta',
  savedSearches: '/cuenta/busquedas',
  favorites: '/cuenta/favoritos',
  alerts: '/cuenta/alertas',
  settings: '/cuenta/ajustes',
} as const

/* ─── Admin Panel ─── */
export const ADMIN_ROUTES = {
  login: '/admin/login',
  dashboard: '/admin',
  properties: '/admin/propiedades',
  propertyNew: '/admin/propiedades/nueva',
  propertyEdit: '/admin/propiedades/[id]',
  blog: '/admin/blog',
  blogNew: '/admin/blog/nueva',
  blogEdit: '/admin/blog/[id]',
  blogCategories: '/admin/blog/categorias',
  leads: '/admin/leads',
  users: '/admin/usuarios',
  media: '/admin/media',
  analytics: '/admin/analytics',
  options: '/admin/opciones',
  settings: '/admin/ajustes',
} as const

/* ─── API Routes ─── */
export const API_ROUTES = {
  properties: '/api/properties',
  propertyById: '/api/properties/[id]',
  search: '/api/search',
  contact: '/api/contact',
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    session: '/api/auth/session',
    resetPassword: '/api/auth/reset-password',
    changePassword: '/api/auth/change-password',
    updateProfile: '/api/auth/profile',
    setup2fa: '/api/auth/2fa/setup',
    verify2fa: '/api/auth/2fa/verify',
  },
  favorites: '/api/favorites',
  alerts: '/api/alerts',
  media: '/api/media',
  leads: '/api/leads',
} as const

/* ─── Admin API Routes (auth-protected) ─── */
export const ADMIN_API_ROUTES = {
  auth: '/api/admin/auth',
  properties: '/api/admin/properties',
  propertyById: (id: string) => `/api/admin/properties/${id}`,
  users: '/api/admin/users',
  media: '/api/admin/media',
  mediaFolders: '/api/admin/media/folders',
  mediaPresign: '/api/admin/media/presign',
  definitions: '/api/admin/definitions',
  definitionById: (id: string) => `/api/admin/definitions/${id}`,
  blogPosts: '/api/admin/blog/posts',
  blogPostById: (id: string) => `/api/admin/blog/posts/${id}`,
  blogCategories: '/api/admin/blog/categories',
  blogCategoryById: (id: string) => `/api/admin/blog/categories/${id}`,
  unsplashSearch: '/api/admin/unsplash/search',
  blogMedia: '/api/admin/blog/media',
  blogMediaPresign: '/api/admin/blog/media/presign',
} as const
