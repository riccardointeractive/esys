/**
 * Seed script: creates 6 example properties in Alicante using existing media library photos.
 * Each property gets 5 images — the first image is unique, the remaining 4 are shared.
 *
 * Usage:
 *   node scripts/seed-properties.mjs
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

const PROPERTIES_TABLE = 'esys_properties'
const IMAGES_TABLE = 'esys_property_images'
const FEATURES_TABLE = 'esys_property_features'

/* ─── Media URLs (from esys_media) ─── */

const PHOTOS = [
  'https://pub-dbc02ff8e82f4cbdbd70c136fe5e21ff.r2.dev/media/619c7cfd-6e96-47e1-b2bf-17d3481ae762-1.avif',
  'https://pub-dbc02ff8e82f4cbdbd70c136fe5e21ff.r2.dev/media/c8a1963e-86ff-444a-b130-d19e3819540c-photo-1560448204-e02f11c3d0e2.avif',
  'https://pub-dbc02ff8e82f4cbdbd70c136fe5e21ff.r2.dev/media/a4d90917-4833-4582-9765-013b0d885036-photo-1585128792020-803d29415281.avif',
  'https://pub-dbc02ff8e82f4cbdbd70c136fe5e21ff.r2.dev/media/12f7ad6b-0488-433b-83e9-6d61622b71c1-photo-1633505899118-4ca6bd143043.avif',
  'https://pub-dbc02ff8e82f4cbdbd70c136fe5e21ff.r2.dev/media/ffe2b348-bba0-4010-982c-4c302172ae04-photo-1585412727339-54e4bae3bbf9.avif',
]

/**
 * Build the 5-image array for a property.
 * The first image (hero) is unique per property — we rotate through PHOTOS.
 * The remaining 4 are the other photos (in order).
 */
function buildImages(propertyIndex) {
  const heroIndex = propertyIndex % PHOTOS.length
  const hero = PHOTOS[heroIndex]
  const rest = PHOTOS.filter((_, i) => i !== heroIndex)
  return [hero, ...rest].map((url, i) => ({
    url,
    alt_text: i === 0 ? 'Fachada principal' : `Interior ${i}`,
    sort_order: i,
  }))
}

/* ─── Property Data ─── */

const properties = [
  {
    title_es: 'Villa moderna con piscina en Playa de San Juan',
    title_en: 'Modern villa with pool in Playa de San Juan',
    title_ru: 'Современная вилла с бассейном на Плайя-де-Сан-Хуан',
    description_es: 'Espectacular villa de nueva construcción con amplias zonas exteriores, piscina privada y vistas al Mediterráneo. Acabados de alta calidad, cocina equipada y garaje doble. A 5 minutos a pie de la playa.',
    description_en: 'Spectacular new-build villa with spacious outdoor areas, private pool and Mediterranean views. High-quality finishes, equipped kitchen and double garage. 5-minute walk to the beach.',
    description_ru: 'Великолепная вилла новой постройки с просторными открытыми зонами, частным бассейном и видом на Средиземное море. Высококачественная отделка, оборудованная кухня и двойной гараж.',
    type: 'villa',
    status: 'available',
    category: 'newBuild',
    price: 485000,
    area: 220,
    bedrooms: 4,
    bathrooms: 3,
    address: 'Calle del Mar 15',
    city: 'Alicante',
    province: 'Alicante',
    postal_code: '03540',
    latitude: 38.3717,
    longitude: -0.4327,
    energy_rating: 'B',
    year_built: 2025,
    floor: null,
    featured: true,
    published: true,
    features: ['pool', 'garden', 'terrace', 'garage', 'airConditioning', 'seaView'],
  },
  {
    title_es: 'Piso reformado en el centro de Alicante',
    title_en: 'Renovated apartment in Alicante city centre',
    title_ru: 'Отремонтированная квартира в центре Аликанте',
    description_es: 'Luminoso piso completamente reformado en pleno centro de Alicante. Tres dormitorios, dos baños y un amplio salón con balcón. Edificio con ascensor. Cerca de todos los servicios y del paseo marítimo.',
    description_en: 'Bright, fully renovated apartment in the heart of Alicante. Three bedrooms, two bathrooms and a spacious living room with balcony. Building with elevator. Close to all amenities and the seafront promenade.',
    description_ru: 'Светлая, полностью отремонтированная квартира в самом центре Аликанте. Три спальни, две ванные комнаты и просторная гостиная с балконом. Здание с лифтом.',
    type: 'apartment',
    status: 'available',
    category: 'resale',
    price: 215000,
    area: 105,
    bedrooms: 3,
    bathrooms: 2,
    address: 'Avenida de la Constitución 42, 3ºA',
    city: 'Alicante',
    province: 'Alicante',
    postal_code: '03002',
    latitude: 38.3452,
    longitude: -0.4815,
    energy_rating: 'C',
    year_built: 2003,
    floor: 3,
    featured: false,
    published: true,
    features: ['balcony', 'elevator', 'airConditioning', 'heating'],
  },
  {
    title_es: 'Ático dúplex con terraza panorámica en El Campello',
    title_en: 'Duplex penthouse with panoramic terrace in El Campello',
    title_ru: 'Двухуровневый пентхаус с панорамной террасой в Эль-Кампельо',
    description_es: 'Impresionante ático dúplex con terraza de 60 m² y vistas panorámicas al mar y a la montaña. Dos plantas con 3 dormitorios, 2 baños, cocina abierta y plaza de garaje incluida. Urbanización con piscina comunitaria y zona verde.',
    description_en: 'Stunning duplex penthouse with 60 m² terrace and panoramic sea and mountain views. Two floors with 3 bedrooms, 2 bathrooms, open kitchen and parking space included. Complex with community pool and green areas.',
    description_ru: 'Потрясающий двухуровневый пентхаус с террасой 60 м² и панорамным видом на море и горы. Два этажа, 3 спальни, 2 ванные комнаты, открытая кухня и парковочное место.',
    type: 'penthouse',
    status: 'available',
    category: 'resale',
    price: 340000,
    area: 145,
    bedrooms: 3,
    bathrooms: 2,
    address: 'Urbanización Coveta Fumá 8, Ático',
    city: 'El Campello',
    province: 'Alicante',
    postal_code: '03560',
    latitude: 38.4275,
    longitude: -0.3928,
    energy_rating: 'D',
    year_built: 2010,
    floor: 6,
    featured: true,
    published: true,
    features: ['terrace', 'garage', 'communityPool', 'seaView', 'mountainView', 'airConditioning'],
  },
  {
    title_es: 'Casa adosada con jardín en Mutxamel',
    title_en: 'Townhouse with garden in Mutxamel',
    title_ru: 'Таунхаус с садом в Мучамеле',
    description_es: 'Precioso adosado en zona residencial tranquila de Mutxamel. Tres plantas con 4 dormitorios, 3 baños, jardín privado, barbacoa y garaje. Piscina comunitaria y zona infantil. A 15 minutos del centro de Alicante.',
    description_en: 'Beautiful townhouse in a quiet residential area of Mutxamel. Three floors with 4 bedrooms, 3 bathrooms, private garden, barbecue and garage. Community pool and children\'s area. 15 minutes from Alicante centre.',
    description_ru: 'Красивый таунхаус в тихом жилом районе Мучамеля. Три этажа, 4 спальни, 3 ванные комнаты, частный сад, барбекю и гараж. Общий бассейн и детская площадка.',
    type: 'townhouse',
    status: 'available',
    category: 'resale',
    price: 275000,
    area: 180,
    bedrooms: 4,
    bathrooms: 3,
    address: 'Calle de los Olivos 23',
    city: 'Mutxamel',
    province: 'Alicante',
    postal_code: '03110',
    latitude: 38.4142,
    longitude: -0.4435,
    energy_rating: 'C',
    year_built: 2015,
    floor: null,
    featured: false,
    published: true,
    features: ['garden', 'garage', 'communityPool', 'airConditioning', 'heating', 'storage'],
  },
  {
    title_es: 'Apartamento de obra nueva en Gran Vía de Alicante',
    title_en: 'New-build apartment on Gran Vía in Alicante',
    title_ru: 'Квартира в новостройке на Гран-Виа в Аликанте',
    description_es: 'Moderno apartamento de 2 dormitorios en promoción de obra nueva sobre la Gran Vía. Diseño contemporáneo, materiales premium, domótica y eficiencia energética A. Terraza privada con vistas a la ciudad. Garaje y trastero incluidos.',
    description_en: 'Modern 2-bedroom apartment in a new-build development on Gran Vía. Contemporary design, premium materials, home automation and A-rated energy efficiency. Private terrace with city views. Garage and storage included.',
    description_ru: 'Современная квартира с 2 спальнями в новом жилом комплексе на Гран-Виа. Современный дизайн, премиальные материалы, умный дом и энергоэффективность класса A.',
    type: 'apartment',
    status: 'reserved',
    category: 'newBuild',
    price: 295000,
    area: 92,
    bedrooms: 2,
    bathrooms: 2,
    address: 'Gran Vía 88, 5ºB',
    city: 'Alicante',
    province: 'Alicante',
    postal_code: '03004',
    latitude: 38.3498,
    longitude: -0.4897,
    energy_rating: 'A',
    year_built: 2026,
    floor: 5,
    featured: true,
    published: true,
    features: ['terrace', 'garage', 'storage', 'elevator', 'airConditioning', 'heating'],
  },
  {
    title_es: 'Chalet independiente con parcela en San Vicente del Raspeig',
    title_en: 'Detached house with plot in San Vicente del Raspeig',
    title_ru: 'Отдельный дом с участком в Сан-Висенте-дель-Распейг',
    description_es: 'Magnífico chalet independiente en parcela de 500 m² con piscina privada, jardín mediterráneo y zona de aparcamiento. Cuatro dormitorios, tres baños, amplio salón con chimenea y cocina de diseño. Zona universitaria, excelentes comunicaciones.',
    description_en: 'Magnificent detached house on a 500 m² plot with private pool, Mediterranean garden and parking area. Four bedrooms, three bathrooms, spacious living room with fireplace and designer kitchen. University area, excellent transport links.',
    description_ru: 'Великолепный отдельный дом на участке 500 м² с частным бассейном, средиземноморским садом и парковкой. Четыре спальни, три ванные комнаты, просторная гостиная с камином.',
    type: 'house',
    status: 'available',
    category: 'resale',
    price: 520000,
    area: 260,
    bedrooms: 4,
    bathrooms: 3,
    address: 'Partida de Canastell 47',
    city: 'San Vicente del Raspeig',
    province: 'Alicante',
    postal_code: '03690',
    latitude: 38.3962,
    longitude: -0.5238,
    energy_rating: 'D',
    year_built: 2008,
    floor: null,
    featured: false,
    published: true,
    features: ['pool', 'garden', 'garage', 'airConditioning', 'heating', 'furnished'],
  },
]

/* ─── Slug Generation ─── */

function generateSlug(title) {
  const charMap = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ñ: 'n', ü: 'u' }
  return title
    .toLowerCase()
    .replace(/[áéíóúñü]/g, (c) => charMap[c] || c)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/* ─── Execute ─── */

async function seed() {
  console.log(`Seeding ${properties.length} properties...`)

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i]
    const { features, ...propertyData } = prop
    const slug = generateSlug(prop.title_es)

    // Check if slug already exists
    const { data: existing } = await supabase
      .from(PROPERTIES_TABLE)
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      console.log(`  ⏭  "${prop.title_es}" already exists, skipping.`)
      continue
    }

    // Insert property
    const { data: inserted, error: propError } = await supabase
      .from(PROPERTIES_TABLE)
      .insert({ ...propertyData, slug })
      .select('id')
      .single()

    if (propError) {
      console.error(`  ✗  Failed to insert "${prop.title_es}":`, propError.message)
      continue
    }

    const propertyId = inserted.id

    // Insert features
    if (features.length > 0) {
      const featureRows = features.map((key) => ({
        property_id: propertyId,
        feature_key: key,
      }))
      const { error: featError } = await supabase.from(FEATURES_TABLE).insert(featureRows)
      if (featError) console.error(`  ⚠  Features error for "${prop.title_es}":`, featError.message)
    }

    // Insert images (hero rotated, rest shared)
    const images = buildImages(i)
    const imageRows = images.map((img) => ({
      property_id: propertyId,
      url: img.url,
      alt_text: img.alt_text,
      sort_order: img.sort_order,
    }))
    const { error: imgError } = await supabase.from(IMAGES_TABLE).insert(imageRows)
    if (imgError) console.error(`  ⚠  Images error for "${prop.title_es}":`, imgError.message)

    console.log(`  ✓  "${prop.title_es}" (${propertyId})`)
  }

  console.log('Done.')
}

seed()
