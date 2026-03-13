/* ─── Property Types & Configuration ─── */

export const PROPERTY_TYPES = {
  apartment: 'Piso',
  house: 'Casa',
  villa: 'Villa',
  penthouse: 'Ático',
  duplex: 'Dúplex',
  studio: 'Estudio',
  townhouse: 'Adosado',
  land: 'Terreno',
  commercial: 'Local Comercial',
  garage: 'Garaje',
} as const

export const PROPERTY_STATUS = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
} as const

export const PROPERTY_CATEGORY = {
  newBuild: 'Obra Nueva',
  resale: 'Segunda Mano',
} as const

export const PROPERTY_FEATURES = {
  pool: 'Piscina',
  garden: 'Jardín',
  terrace: 'Terraza',
  balcony: 'Balcón',
  garage: 'Garaje',
  storage: 'Trastero',
  elevator: 'Ascensor',
  airConditioning: 'Aire Acondicionado',
  heating: 'Calefacción',
  furnished: 'Amueblado',
  seaView: 'Vistas al Mar',
  mountainView: 'Vistas a la Montaña',
  communityPool: 'Piscina Comunitaria',
  security: 'Seguridad 24h',
  gym: 'Gimnasio',
  concierge: 'Conserjería',
} as const

export const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const

export const SORT_OPTIONS = {
  priceAsc: 'Precio: menor a mayor',
  priceDesc: 'Precio: mayor a menor',
  newest: 'Más recientes',
  sizeDesc: 'Mayor superficie',
  sizeAsc: 'Menor superficie',
} as const

export const PRICE_RANGES = {
  min: 0,
  max: 5_000_000,
  step: 10_000,
} as const

export const SIZE_RANGES = {
  min: 0,
  max: 1_000,
  step: 10,
  unit: 'm²',
} as const

export const BEDROOMS_OPTIONS = [1, 2, 3, 4, 5] as const
export const BATHROOMS_OPTIONS = [1, 2, 3, 4] as const
