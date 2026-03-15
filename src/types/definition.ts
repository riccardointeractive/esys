/* ─── Definition Types ─── */

export interface Definition {
  id: string
  category: DefinitionCategory
  key: string
  label_es: string
  label_en: string
  label_ru: string
  sort_order: number
  active: boolean
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type DefinitionCategory =
  | 'property_type'
  | 'property_status'
  | 'property_category'
  | 'property_feature'
  | 'energy_rating'
  | 'bedroom_option'
  | 'bathroom_option'

export type Locale = 'es' | 'en' | 'ru'

/** key → label map for a given locale */
export type DefinitionMap = Record<string, string>

/** All definition categories grouped */
export type DefinitionsByCategory = Partial<Record<DefinitionCategory, Definition[]>>
