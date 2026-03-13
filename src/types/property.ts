import type { PROPERTY_TYPES, PROPERTY_STATUS, PROPERTY_CATEGORY, PROPERTY_FEATURES, ENERGY_RATINGS } from '@/config/property'

/* ─── Database Row Types ─── */

export interface Property {
  id: string
  title: string
  slug: string
  description: string
  type: keyof typeof PROPERTY_TYPES
  status: keyof typeof PROPERTY_STATUS
  category: keyof typeof PROPERTY_CATEGORY
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
  energy_rating: (typeof ENERGY_RATINGS)[number] | null
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
  feature_key: keyof typeof PROPERTY_FEATURES
}

/* ─── Property with relations ─── */

export interface PropertyWithRelations extends Property {
  images: PropertyImage[]
  features: PropertyFeature[]
}

/* ─── Form Data (create / edit) ─── */

export interface PropertyFormData {
  title: string
  description: string
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
