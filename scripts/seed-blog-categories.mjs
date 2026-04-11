/**
 * One-shot seed for the 7 strategic blog categories used by the SEO roadmap.
 *
 * Idempotent: rows are upserted by slug, so re-running updates labels /
 * descriptions / sort_order without duplicating.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-blog-categories.mjs
 *
 * Env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
const TABLE = 'esys_blog_categories'

/** @type {Array<{ slug: string, label_es: string, label_en: string, label_ru: string, description_es: string, description_en: string, description_ru: string, sort_order: number }>} */
const CATEGORIES = [
  {
    slug: 'guia-de-compra',
    label_es: 'Guía de Compra',
    label_en: 'Buyer’s Guide',
    label_ru: 'Гид покупателя',
    description_es:
      'Todo lo que necesitas saber antes, durante y después de comprar una vivienda en España: trámites, impuestos, hipotecas y contratos.',
    description_en:
      'Everything you need to know before, during and after buying a home in Spain: paperwork, taxes, mortgages and contracts.',
    description_ru:
      'Всё, что нужно знать до, во время и после покупки жилья в Испании: документы, налоги, ипотека и контракты.',
    sort_order: 10,
  },
  {
    slug: 'zonas-y-barrios',
    label_es: 'Zonas y Barrios',
    label_en: 'Areas & Neighborhoods',
    label_ru: 'Районы и зоны',
    description_es:
      'Recorre la Costa Blanca barrio por barrio: Alicante ciudad, pueblos costeros, urbanizaciones y rincones del interior.',
    description_en:
      'Explore the Costa Blanca neighborhood by neighborhood: Alicante city, coastal towns, residential areas and inland villages.',
    description_ru:
      'Путешествие по Коста-Бланке район за районом: город Аликанте, прибрежные городки, жилые комплексы и деревни.',
    sort_order: 20,
  },
  {
    slug: 'estilo-de-vida',
    label_es: 'Estilo de Vida',
    label_en: 'Lifestyle',
    label_ru: 'Образ жизни',
    description_es:
      'Clima, gastronomía, playas, cultura y todo lo que hace que vivir en la Costa Blanca sea una experiencia diaria.',
    description_en:
      'Weather, food, beaches, culture — everything that makes life on the Costa Blanca a daily experience.',
    description_ru:
      'Климат, кухня, пляжи, культура — всё, что делает жизнь на Коста-Бланке ежедневным впечатлением.',
    sort_order: 30,
  },
  {
    slug: 'inversion-inmobiliaria',
    label_es: 'Inversión Inmobiliaria',
    label_en: 'Real Estate Investment',
    label_ru: 'Инвестиции в недвижимость',
    description_es:
      'Rentabilidad del alquiler, revalorización, fiscalidad para no residentes e indicadores clave para invertir en la Costa Blanca.',
    description_en:
      'Rental yields, appreciation, non-resident tax treatment and the key indicators for investing on the Costa Blanca.',
    description_ru:
      'Доходность аренды, рост стоимости, налоги для нерезидентов и ключевые показатели инвестиций на Коста-Бланке.',
    sort_order: 40,
  },
  {
    slug: 'obra-nueva-guia',
    label_es: 'Obra Nueva',
    label_en: 'New Builds',
    label_ru: 'Новостройки',
    description_es:
      'Comprar sobre plano, memorias de calidades, garantías, eficiencia energética y todo lo que rodea a una promoción de obra nueva.',
    description_en:
      'Buying off-plan, quality specs, warranties, energy efficiency and everything around a new-build development.',
    description_ru:
      'Покупка на этапе строительства, спецификации качества, гарантии, энергоэффективность и всё, что связано с новостройкой.',
    sort_order: 50,
  },
  {
    slug: 'segunda-mano-guia',
    label_es: 'Segunda Mano',
    label_en: 'Resale',
    label_ru: 'Вторичное жильё',
    description_es:
      'Cómo valorar, inspeccionar y reformar una vivienda de segunda mano. Subvenciones, licencias y trucos para detectar problemas.',
    description_en:
      'How to value, inspect and renovate a resale home. Grants, permits and tips for spotting issues.',
    description_ru:
      'Как оценить, проверить и отремонтировать вторичное жильё. Субсидии, разрешения и советы по выявлению проблем.',
    sort_order: 60,
  },
  {
    slug: 'mudarse-a-espana',
    label_es: 'Mudarse a España',
    label_en: 'Moving to Spain',
    label_ru: 'Переезд в Испанию',
    description_es:
      'Visados, residencia, sanidad, colegios y trámites esenciales para empezar una nueva vida en la Costa Blanca.',
    description_en:
      'Visas, residency, healthcare, schools and the essential paperwork to start a new life on the Costa Blanca.',
    description_ru:
      'Визы, резиденция, здравоохранение, школы и основные документы для новой жизни на Коста-Бланке.',
    sort_order: 70,
  },
]

async function main() {
  console.log(`Seeding ${CATEGORIES.length} blog categories into ${SUPABASE_URL}…\n`)

  for (const cat of CATEGORIES) {
    const { data: existing } = await supabase
      .from(TABLE)
      .select('id, slug')
      .eq('slug', cat.slug)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from(TABLE)
        .update({ ...cat, active: true, deleted_at: null })
        .eq('id', existing.id)
      if (error) {
        console.error(`✗ update ${cat.slug}: ${error.message}`)
        process.exitCode = 1
        continue
      }
      console.log(`↻ ${cat.slug.padEnd(22)} updated`)
    } else {
      const { error } = await supabase
        .from(TABLE)
        .insert({ ...cat, active: true })
      if (error) {
        console.error(`✗ insert ${cat.slug}: ${error.message}`)
        process.exitCode = 1
        continue
      }
      console.log(`+ ${cat.slug.padEnd(22)} created`)
    }
  }

  console.log('\n✅ Done.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
