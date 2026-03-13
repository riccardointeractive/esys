/* ─── SEO Configuration ─── */

export const SEO_CONFIG = {
  titleTemplate: '%s | ESYS VIP',
  defaultTitle: 'ESYS VIP — Inmobiliaria de Confianza',
  defaultDescription: 'Encuentra tu hogar ideal. Propiedades de obra nueva y segunda mano con asesoramiento profesional.',

  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'ESYS VIP',
  },

  pages: {
    home: {
      title: 'Inicio',
      description: 'ESYS VIP — Tu inmobiliaria de confianza para obra nueva y segunda mano.',
    },
    properties: {
      title: 'Propiedades',
      description: 'Explora nuestra selección de propiedades en venta.',
    },
    newBuilds: {
      title: 'Obra Nueva',
      description: 'Promociones de obra nueva con las mejores calidades.',
    },
    resale: {
      title: 'Segunda Mano',
      description: 'Propiedades de segunda mano seleccionadas por nuestro equipo.',
    },
    about: {
      title: 'Nosotros',
      description: 'Conoce al equipo de ESYS VIP y nuestra experiencia en el sector inmobiliario.',
    },
    contact: {
      title: 'Contacto',
      description: 'Ponte en contacto con ESYS VIP. Estamos aquí para ayudarte.',
    },
  },
} as const
