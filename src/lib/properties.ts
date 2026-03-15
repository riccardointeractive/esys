import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { Property, PropertyImage, PropertyWithRelations } from '@/types/property'

/* ─── Public property queries (published only) ─── */

interface FetchPropertiesOptions {
  category?: 'newBuild' | 'resale'
  featured?: boolean
  limit?: number
}

/** Fetch published properties with their first image. */
export async function fetchProperties(opts: FetchPropertiesOptions = {}) {
  const supabase = getAdminClient()

  let query = supabase
    .from(TABLES.properties)
    .select('*')
    .is('deleted_at', null)
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (opts.category) query = query.eq('category', opts.category)
  if (opts.featured) query = query.eq('featured', true)
  if (opts.limit) query = query.limit(opts.limit)

  const { data: properties, error } = await query

  if (error || !properties?.length) return []

  const ids = properties.map((p) => p.id)

  const { data: images } = await supabase
    .from(TABLES.propertyImages)
    .select('*')
    .in('property_id', ids)
    .order('sort_order', { ascending: true })

  const imageMap = new Map<string, PropertyImage>()
  for (const img of images ?? []) {
    if (!imageMap.has(img.property_id)) {
      imageMap.set(img.property_id, img)
    }
  }

  return properties.map((p) => ({
    ...p,
    firstImage: imageMap.get(p.id) ?? null,
  })) as (Property & { firstImage: PropertyImage | null })[]
}

/** Fetch a single published property by slug with all images and features. */
export async function fetchPropertyBySlug(slug: string): Promise<PropertyWithRelations | null> {
  const supabase = getAdminClient()

  const { data: property, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .eq('published', true)
    .maybeSingle()

  if (error || !property) return null

  const [{ data: images }, { data: features }] = await Promise.all([
    supabase
      .from(TABLES.propertyImages)
      .select('*')
      .eq('property_id', property.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from(TABLES.propertyFeatures)
      .select('*')
      .eq('property_id', property.id),
  ])

  return {
    ...property,
    images: images ?? [],
    features: features ?? [],
  } as PropertyWithRelations
}
