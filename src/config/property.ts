/* ─── Property Types & Configuration ─── */

/*
 * DEFAULT_* constants are seed/fallback values.
 * Runtime values come from esys_definitions table (managed via Admin > Ajustes).
 */

export const DEFAULT_PROPERTY_TYPES = {
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

export const DEFAULT_PROPERTY_STATUS = {
  available: 'Disponible',
  reserved: 'Reservado',
  sold: 'Vendido',
} as const

export const DEFAULT_PROPERTY_CATEGORY = {
  newBuild: 'Obra Nueva',
  resale: 'Segunda Mano',
} as const

export const DEFAULT_PROPERTY_FEATURES = {
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

export const DEFAULT_ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const

export const DEFAULT_BEDROOMS_OPTIONS = [1, 2, 3, 4, 5] as const
export const DEFAULT_BATHROOMS_OPTIONS = [1, 2, 3, 4] as const

/* ─── Backward-compat aliases (used until all consumers are migrated) ─── */

export const PROPERTY_TYPES = DEFAULT_PROPERTY_TYPES
export const PROPERTY_STATUS = DEFAULT_PROPERTY_STATUS
export const PROPERTY_CATEGORY = DEFAULT_PROPERTY_CATEGORY
export const PROPERTY_FEATURES = DEFAULT_PROPERTY_FEATURES
export const ENERGY_RATINGS = DEFAULT_ENERGY_RATINGS
export const BEDROOMS_OPTIONS = DEFAULT_BEDROOMS_OPTIONS
export const BATHROOMS_OPTIONS = DEFAULT_BATHROOMS_OPTIONS

/* ─── Definition Categories (DB column values) ─── */

export const DEFINITION_CATEGORIES = {
  propertyType: 'property_type',
  propertyStatus: 'property_status',
  propertyCategory: 'property_category',
  propertyFeature: 'property_feature',
  energyRating: 'energy_rating',
  bedroomOption: 'bedroom_option',
  bathroomOption: 'bathroom_option',
} as const

/* ─── Static config (stays in code, not in DB) ─── */

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
