/**
 * Seed script: populates esys_definitions table from hardcoded config values.
 * Idempotent — uses ON CONFLICT DO NOTHING so existing data is never overwritten.
 *
 * Usage:
 *   node scripts/seed-definitions.mjs
 *
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const TABLE = 'esys_definitions'

/* ─── Seed Data ─── */

const definitions = [
  // Property Types
  ...typeDefs('property_type', {
    apartment: ['Piso', 'Apartment', 'Квартира'],
    house: ['Casa', 'House', 'Дом'],
    villa: ['Villa', 'Villa', 'Вилла'],
    penthouse: ['Ático', 'Penthouse', 'Пентхаус'],
    duplex: ['Dúplex', 'Duplex', 'Дуплекс'],
    studio: ['Estudio', 'Studio', 'Студия'],
    townhouse: ['Adosado', 'Townhouse', 'Таунхаус'],
    land: ['Terreno', 'Land', 'Участок'],
    commercial: ['Local Comercial', 'Commercial', 'Коммерческая недвижимость'],
    garage: ['Garaje', 'Garage', 'Гараж'],
  }),

  // Property Status
  ...typeDefs('property_status', {
    available: ['Disponible', 'Available', 'Доступно'],
    reserved: ['Reservado', 'Reserved', 'Забронировано'],
    sold: ['Vendido', 'Sold', 'Продано'],
  }, {
    available: { badge_variant: 'success' },
    reserved: { badge_variant: 'warning' },
    sold: { badge_variant: 'error' },
  }),

  // Property Category
  ...typeDefs('property_category', {
    newBuild: ['Obra Nueva', 'New Build', 'Новостройка'],
    resale: ['Segunda Mano', 'Resale', 'Вторичное жильё'],
  }),

  // Property Features
  ...typeDefs('property_feature', {
    pool: ['Piscina', 'Pool', 'Бассейн'],
    garden: ['Jardín', 'Garden', 'Сад'],
    terrace: ['Terraza', 'Terrace', 'Терраса'],
    balcony: ['Balcón', 'Balcony', 'Балкон'],
    garage: ['Garaje', 'Garage', 'Гараж'],
    storage: ['Trastero', 'Storage', 'Кладовая'],
    elevator: ['Ascensor', 'Elevator', 'Лифт'],
    airConditioning: ['Aire Acondicionado', 'Air Conditioning', 'Кондиционер'],
    heating: ['Calefacción', 'Heating', 'Отопление'],
    furnished: ['Amueblado', 'Furnished', 'С мебелью'],
    seaView: ['Vistas al Mar', 'Sea View', 'Вид на море'],
    mountainView: ['Vistas a la Montaña', 'Mountain View', 'Вид на горы'],
    communityPool: ['Piscina Comunitaria', 'Community Pool', 'Общий бассейн'],
    security: ['Seguridad 24h', '24h Security', 'Охрана 24ч'],
    gym: ['Gimnasio', 'Gym', 'Спортзал'],
    concierge: ['Conserjería', 'Concierge', 'Консьерж'],
  }),

  // Energy Ratings
  ...['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((r, i) => ({
    category: 'energy_rating',
    key: r,
    label_es: r,
    label_en: r,
    label_ru: r,
    sort_order: i,
    active: true,
    metadata: {},
  })),

  // Bedroom Options
  ...[1, 2, 3, 4, 5].map((n, i) => ({
    category: 'bedroom_option',
    key: String(n),
    label_es: String(n),
    label_en: String(n),
    label_ru: String(n),
    sort_order: i,
    active: true,
    metadata: {},
  })),

  // Bathroom Options
  ...[1, 2, 3, 4].map((n, i) => ({
    category: 'bathroom_option',
    key: String(n),
    label_es: String(n),
    label_en: String(n),
    label_ru: String(n),
    sort_order: i,
    active: true,
    metadata: {},
  })),
]

/**
 * Convert a category + label map into definition rows.
 */
function typeDefs(category, labels, metadataMap = {}) {
  return Object.entries(labels).map(([key, [es, en, ru]], index) => ({
    category,
    key,
    label_es: es,
    label_en: en,
    label_ru: ru,
    sort_order: index,
    active: true,
    metadata: metadataMap[key] || {},
  }))
}

/* ─── Execute ─── */

async function seed() {
  console.log(`Seeding ${definitions.length} definitions into ${TABLE}...`)

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(definitions, { onConflict: 'category,key', ignoreDuplicates: true })
    .select()

  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`Done. ${data?.length ?? 0} rows inserted/updated.`)
}

seed()
