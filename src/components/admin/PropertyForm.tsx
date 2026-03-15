'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { CustomSelect } from '@digiko-npm/cms/ui'
import { PropertyFeatureSelector } from '@/components/admin/PropertyFeatureSelector'
import { PropertyImageManager } from '@/components/admin/PropertyImageManager'
import { PROPERTY_TYPES, PROPERTY_STATUS, PROPERTY_CATEGORY, ENERGY_RATINGS, BEDROOMS_OPTIONS, BATHROOMS_OPTIONS } from '@/config/property'
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from '@/config/routes'
import type { PropertyFormData, PropertyWithRelations, PropertyImageInput } from '@/types/property'

interface PropertyFormProps {
  /** Existing property data (edit mode) */
  property?: PropertyWithRelations
}

const typeOptions = Object.entries(PROPERTY_TYPES).map(([k, l]) => ({ value: k, label: l }))
const statusOptions = Object.entries(PROPERTY_STATUS).map(([k, l]) => ({ value: k, label: l }))
const categoryOptions = Object.entries(PROPERTY_CATEGORY).map(([k, l]) => ({ value: k, label: l }))
const bedroomOptions = BEDROOMS_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))
const bathroomOptions = BATHROOMS_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))
const energyOptions = ENERGY_RATINGS.map((r) => ({ value: r, label: r }))

function toFormData(p?: PropertyWithRelations): PropertyFormData {
  if (!p) {
    return {
      title: '',
      description: '',
      type: 'apartment',
      status: 'available',
      category: 'newBuild',
      price: 0,
      area: 0,
      bedrooms: 1,
      bathrooms: 1,
      address: '',
      city: '',
      province: '',
      postal_code: '',
      latitude: null,
      longitude: null,
      energy_rating: '',
      year_built: null,
      floor: null,
      featured: false,
      published: false,
      features: [],
      images: [],
    }
  }

  return {
    title: p.title,
    description: p.description,
    type: p.type,
    status: p.status,
    category: p.category,
    price: p.price,
    area: p.area,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    address: p.address,
    city: p.city,
    province: p.province,
    postal_code: p.postal_code,
    latitude: p.latitude,
    longitude: p.longitude,
    energy_rating: p.energy_rating || '',
    year_built: p.year_built,
    floor: p.floor,
    featured: p.featured,
    published: p.published,
    features: p.features.map((f) => f.feature_key),
    images: p.images.map((img) => ({
      url: img.url,
      alt_text: img.alt_text,
      sort_order: img.sort_order,
    })),
  }
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const isEdit = !!property
  const [form, setForm] = useState<PropertyFormData>(() => toFormData(property))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateField<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = isEdit
        ? ADMIN_API_ROUTES.propertyById(property!.id)
        : ADMIN_API_ROUTES.properties
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al guardar la propiedad')
      }

      router.push(ADMIN_ROUTES.properties)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="vip-property-form" autoComplete="off">
      {/* Header */}
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
        <div className="ds-flex ds-items-center ds-gap-3">
          <button
            type="button"
            onClick={() => router.push(ADMIN_ROUTES.properties)}
            className="ds-btn ds-btn--ghost ds-btn--sm"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary">
            {isEdit ? 'Editar Propiedad' : 'Nueva Propiedad'}
          </h1>
        </div>
        <button type="submit" className="ds-btn" disabled={saving}>
          {saving ? <Loader2 size={18} className="ds-animate-spin" /> : <Save size={18} />}
          <span className="ds-ml-2">{saving ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>

      {error && (
        <div className="ds-alert ds-alert--error ds-mb-4">
          {error}
        </div>
      )}

      <div className="vip-property-form__layout">
        {/* ─── Main Column ─── */}
        <div className="vip-property-form__main">
          {/* Basic Info */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Información básica</h2>
            </div>
            <div className="ds-card__body">
              <div className="ds-form">
                <div>
                  <label className="ds-label">Título</label>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ej: Ático con vistas al mar"
                    required
                  />
                </div>
                <div>
                  <label className="ds-label">Descripción</label>
                  <textarea
                    className="ds-textarea"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe la propiedad..."
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Detalles</h2>
            </div>
            <div className="ds-card__body">
              <div className="ds-grid ds-grid-cols-2 ds-md:grid-cols-3 ds-gap-4">
                <div>
                  <label className="ds-label">Tipo</label>
                  <CustomSelect
                    options={typeOptions}
                    value={form.type}
                    onChange={(v) => updateField('type', v)}
                    label="Tipo"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="ds-label">Categoría</label>
                  <CustomSelect
                    options={categoryOptions}
                    value={form.category}
                    onChange={(v) => updateField('category', v)}
                    label="Categoría"
                    size="lg"
                  />
                </div>
                <div>
                  <label className="ds-label">Precio (€)</label>
                  <input
                    type="number"
                    className="ds-input ds-input--lg"
                    value={form.price || ''}
                    onChange={(e) => updateField('price', Number(e.target.value))}
                    min={0}
                    step={1000}
                  />
                </div>
                <div>
                  <label className="ds-label">Superficie (m²)</label>
                  <input
                    type="number"
                    className="ds-input ds-input--lg"
                    value={form.area || ''}
                    onChange={(e) => updateField('area', Number(e.target.value))}
                    min={0}
                  />
                </div>
                <div>
                  <label className="ds-label">Habitaciones</label>
                  <CustomSelect
                    options={bedroomOptions}
                    value={String(form.bedrooms)}
                    onChange={(v) => updateField('bedrooms', Number(v))}
                    label="Habitaciones"
                    size="lg"
                    searchable={false}
                  />
                </div>
                <div>
                  <label className="ds-label">Baños</label>
                  <CustomSelect
                    options={bathroomOptions}
                    value={String(form.bathrooms)}
                    onChange={(v) => updateField('bathrooms', Number(v))}
                    label="Baños"
                    size="lg"
                    searchable={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Ubicación</h2>
            </div>
            <div className="ds-card__body">
              <div className="ds-grid ds-grid-cols-2 ds-gap-4">
                <div className="ds-col-span-2">
                  <label className="ds-label">Dirección</label>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="Calle, número..."
                  />
                </div>
                <div>
                  <label className="ds-label">Ciudad</label>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="ds-label">Provincia</label>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form.province}
                    onChange={(e) => updateField('province', e.target.value)}
                  />
                </div>
                <div>
                  <label className="ds-label">Código Postal</label>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form.postal_code}
                    onChange={(e) => updateField('postal_code', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Extra */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Información adicional</h2>
            </div>
            <div className="ds-card__body">
              <div className="ds-grid ds-grid-cols-2 ds-md:grid-cols-3 ds-gap-4">
                <div>
                  <label className="ds-label">Certificación Energética</label>
                  <CustomSelect
                    options={energyOptions}
                    value={form.energy_rating}
                    onChange={(v) => updateField('energy_rating', v)}
                    placeholder="Sin certificar"
                    label="Certificación Energética"
                    size="lg"
                    searchable={false}
                  />
                </div>
                <div>
                  <label className="ds-label">Año de construcción</label>
                  <input
                    type="number"
                    className="ds-input ds-input--lg"
                    value={form.year_built ?? ''}
                    onChange={(e) => updateField('year_built', e.target.value ? Number(e.target.value) : null)}
                    min={1900}
                    max={new Date().getFullYear() + 5}
                  />
                </div>
                <div>
                  <label className="ds-label">Planta</label>
                  <input
                    type="number"
                    className="ds-input ds-input--lg"
                    value={form.floor ?? ''}
                    onChange={(e) => updateField('floor', e.target.value ? Number(e.target.value) : null)}
                    min={-3}
                    max={50}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sidebar Column ─── */}
        <div className="vip-property-form__sidebar">
          {/* Status & Visibility */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Estado</h2>
            </div>
            <div className="ds-card__body">
              <div className="ds-form">
                <div>
                  <CustomSelect
                    options={statusOptions}
                    value={form.status}
                    onChange={(v) => updateField('status', v)}
                    label="Estado"
                    size="lg"
                    searchable={false}
                  />
                </div>
                <div className="ds-flex ds-flex-col ds-gap-3">
                  <label className="ds-checkbox">
                    <input
                      type="checkbox"
                      checked={form.published}
                      onChange={(e) => updateField('published', e.target.checked)}
                    />
                    <span>Publicada</span>
                  </label>
                  <label className="ds-checkbox">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => updateField('featured', e.target.checked)}
                    />
                    <span>Destacada</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Imágenes</h2>
            </div>
            <div className="ds-card__body">
              <PropertyImageManager
                images={form.images}
                onChange={(images) => updateField('images', images)}
              />
            </div>
          </div>

          {/* Features */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Características</h2>
            </div>
            <div className="ds-card__body">
              <PropertyFeatureSelector
                selected={form.features}
                onChange={(features) => updateField('features', features)}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
