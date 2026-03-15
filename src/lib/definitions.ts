import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import { DEFINITION_CATEGORIES } from '@/config/property'
import type { Definition, DefinitionCategory, DefinitionMap, DefinitionsByCategory, Locale } from '@/types/definition'

/* ─── Fetch active definitions by category ─── */

export async function getDefinitions(category: DefinitionCategory): Promise<Definition[]> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.definitions)
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error(`Failed to fetch definitions for ${category}:`, error.message)
    return []
  }

  return (data ?? []) as Definition[]
}

/* ─── Fetch all categories at once ─── */

export async function getAllDefinitions(): Promise<DefinitionsByCategory> {
  const categories = Object.values(DEFINITION_CATEGORIES) as DefinitionCategory[]
  const results = await Promise.all(categories.map((cat) => getDefinitions(cat)))

  const grouped: DefinitionsByCategory = {}
  categories.forEach((cat, idx) => {
    grouped[cat] = results[idx]
  })
  return grouped
}

/* ─── Fetch ALL definitions (including inactive) for admin ─── */

export async function getAllDefinitionsAdmin(): Promise<DefinitionsByCategory> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.definitions)
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch all definitions:', error.message)
    return {}
  }

  const grouped: DefinitionsByCategory = {}
  for (const def of (data ?? []) as Definition[]) {
    const cat = def.category as DefinitionCategory
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat]!.push(def)
  }
  return grouped
}

/* ─── Build key→label map for a given locale ─── */

export function toDefinitionMap(definitions: Definition[], locale: Locale = 'es'): DefinitionMap {
  const map: DefinitionMap = {}
  for (const def of definitions) {
    map[def.key] = getLabel(def, locale)
  }
  return map
}

/* ─── Get label for a specific locale with ES fallback ─── */

export function getLabel(def: Definition, locale: Locale = 'es'): string {
  switch (locale) {
    case 'en':
      return def.label_en || def.label_es
    case 'ru':
      return def.label_ru || def.label_es
    default:
      return def.label_es
  }
}
