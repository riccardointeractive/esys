/* ─── Database Row Types ─── */

export interface Property {
  id: string
  title_es: string
  title_en: string
  title_ru: string
  slug: string
  description_es: string
  description_en: string
  description_ru: string
  type: string
  status: string
  category: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  address: string
  city: string
  province: string
  postal_code: string
  latitude: number | null
  longitude: number | null
  energy_rating: string | null
  year_built: number | null
  floor: number | null
  featured: boolean
  published: boolean
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  alt_text: string
  sort_order: number
  created_at: string
}

export interface PropertyFeature {
  id: string
  property_id: string
  feature_key: string
}

/* ─── Property with relations ─── */

export interface PropertyWithRelations extends Property {
  images: PropertyImage[]
  features: PropertyFeature[]
}

/* ─── Form Data (create / edit) ─── */

export interface PropertyFormData {
  title_es: string
  title_en: string
  title_ru: string
  description_es: string
  description_en: string
  description_ru: string
  type: string
  status: string
  category: string
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  address: string
  city: string
  province: string
  postal_code: string
  latitude: number | null
  longitude: number | null
  energy_rating: string
  year_built: number | null
  floor: number | null
  featured: boolean
  published: boolean
  features: string[]
  images: PropertyImageInput[]
}

export interface PropertyImageInput {
  url: string
  alt_text: string
  sort_order: number
}

/* ─── Admin List Params ─── */

export interface PropertyListParams {
  page: number
  limit: number
  search?: string
  status?: string
  category?: string
  type?: string
  sort?: string
}

/* ─── API Responses ─── */

export interface PropertyListResponse {
  data: Property[]
  total: number
  page: number
  limit: number
}
