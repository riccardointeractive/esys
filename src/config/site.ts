import { ROUTES, USER_ROUTES, ADMIN_ROUTES } from './routes'

export const siteConfig = {
  name: 'ESYS VIP',
  title: 'ESYS VIP — Inmobiliaria de Confianza',
  description: 'Encuentra tu hogar ideal. Propiedades de obra nueva y segunda mano con asesoramiento profesional.',
  url: 'https://esysvip.com',
  locale: 'es-ES',
  defaultCurrency: 'EUR',

  contact: {
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'España',
    /** Internal recipient for contact-form submissions (not shown publicly). */
    notificationEmail: 'riccardointeractive@gmail.com',
  },

  social: {
    instagram: '',
    facebook: '',
    whatsapp: '',
    youtube: '',
  },

  nav: [
    { label: 'Inicio', href: ROUTES.home, icon: 'Home' },
    { label: 'Propiedades', href: ROUTES.properties, icon: 'Building2' },
    { label: 'Obra Nueva', href: ROUTES.newBuilds, icon: 'Hammer' },
    { label: 'Segunda Mano', href: ROUTES.resale, icon: 'KeyRound' },
    { label: 'Nosotros', href: ROUTES.about, icon: 'Users' },
    { label: 'Contacto', href: ROUTES.contact, icon: 'Mail' },
  ],

  adminNav: [
    { label: 'Dashboard', href: ADMIN_ROUTES.dashboard, icon: 'LayoutDashboard' },
    { label: 'Propiedades', href: ADMIN_ROUTES.properties, icon: 'Building2' },
    { label: 'Leads', href: ADMIN_ROUTES.leads, icon: 'UserPlus', disabled: true },
    { label: 'Usuarios', href: ADMIN_ROUTES.users, icon: 'Users' },
    { label: 'Media', href: ADMIN_ROUTES.media, icon: 'Image' },
    { label: 'Opciones', href: ADMIN_ROUTES.options, icon: 'ListChecks' },
    { label: 'Analytics', href: ADMIN_ROUTES.analytics, icon: 'BarChart3', disabled: true },
    { label: 'Ajustes', href: ADMIN_ROUTES.settings, icon: 'Settings', disabled: true },
  ],
  admin: {
    itemsPerPage: {
      properties: 20,
      media: 24,
    },
  },

  accountNav: [
    { label: 'Mi Cuenta', href: USER_ROUTES.dashboard, icon: 'User' },
    { label: 'Favoritos', href: USER_ROUTES.favorites, icon: 'Heart' },
    { label: 'Búsquedas', href: USER_ROUTES.savedSearches, icon: 'Search' },
    { label: 'Alertas', href: USER_ROUTES.alerts, icon: 'Bell' },
    { label: 'Ajustes', href: USER_ROUTES.settings, icon: 'Settings' },
  ],
} as const
