'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { CustomSelect } from '@digiko-npm/cms/ui'
import { PropertyFeatureSelector } from '@/components/admin/PropertyFeatureSelector'
import { PropertyImageManager } from '@/components/admin/PropertyImageManager'
import { LocalePills } from '@/components/admin/LocalePills'
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from '@/config/routes'
import type { PropertyFormData, PropertyWithRelations } from '@/types/property'
import type { Definition, DefinitionsByCategory } from '@/types/definition'

type FormLocale = 'es' | 'en' | 'ru'

interface PropertyFormProps {
  property?: PropertyWithRelations
  definitions: DefinitionsByCategory
}

function defsToOptions(defs: Definition[] | undefined): { value: string; label: string }[] {
  return (defs ?? []).map((d) => ({ value: d.key, label: d.label_es }))
}

function toFormData(p?: PropertyWithRelations): PropertyFormData {
  if (!p) {
    return {
      title_es: '',
      title_en: '',
      title_ru: '',
      description_es: '',
      description_en: '',
      description_ru: '',
      type: '',
      status: '',
      category: '',
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
    title_es: p.title_es,
    title_en: p.title_en,
    title_ru: p.title_ru,
    description_es: p.description_es,
    description_en: p.description_en,
    description_ru: p.description_ru,
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

export function PropertyForm({ property, definitions }: PropertyFormProps) {
  const router = useRouter()
  const isEdit = !!property
  const [form, setForm] = useState<PropertyFormData>(() => toFormData(property))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [titleLocale, setTitleLocale] = useState<FormLocale>('es')
  const [descLocale, setDescLocale] = useState<FormLocale>('es')

  const typeOptions = defsToOptions(definitions.property_type)
  const statusOptions = defsToOptions(definitions.property_status)
  const categoryOptions = defsToOptions(definitions.property_category)
  const bedroomOptions = defsToOptions(definitions.bedroom_option)
  const bathroomOptions = defsToOptions(definitions.bathroom_option)
  const energyOptions = defsToOptions(definitions.energy_rating)
  const features = definitions.property_feature ?? []

  function updateField<K extends keyof PropertyFormData>(key: K, value: PropertyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const titleField = `title_${titleLocale}` as const
  const descField = `description_${descLocale}` as const

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
    <form onSubmit={handleSubmit} className="vip-property-form" autoComplete="off" data-1p-ignore data-lpignore="true">
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
                  <div className="ds-flex ds-items-center ds-justify-between ds-mb-1">
                    <label className="ds-label ds-mb-0">Título</label>
                    <LocalePills value={titleLocale} onChange={setTitleLocale} />
                  </div>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form[titleField] as string}
                    onChange={(e) => updateField(titleField, e.target.value)}
                    placeholder={titleLocale === 'es' ? 'Ej: Ático con vistas al mar' : titleLocale === 'en' ? 'e.g.: Penthouse with sea views' : 'Напр.: Пентхаус с видом на море'}
                    required={titleLocale === 'es'}
                  />
                </div>
                <div>
                  <div className="ds-flex ds-items-center ds-justify-between ds-mb-1">
                    <label className="ds-label ds-mb-0">Descripción</label>
                    <LocalePills value={descLocale} onChange={setDescLocale} />
                  </div>
                  <textarea
                    className="ds-textarea"
                    value={form[descField] as string}
                    onChange={(e) => updateField(descField, e.target.value)}
                    placeholder={descLocale === 'es' ? 'Describe la propiedad...' : descLocale === 'en' ? 'Describe the property...' : 'Опишите объект...'}
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
                    placeholder="Seleccionar..."
                    searchPlaceholder="Buscar..."
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
                    placeholder="Seleccionar..."
                    searchPlaceholder="Buscar..."
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
                onChange={(f) => updateField('features', f)}
                features={features}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
