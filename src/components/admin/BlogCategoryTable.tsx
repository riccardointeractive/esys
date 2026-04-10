'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Loader2 } from 'lucide-react'
import { LocalePills } from '@/components/admin/LocalePills'
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from '@/config/routes'
import type { BlogCategory, BlogCategoryFormData } from '@/types/blog'

type FormLocale = 'es' | 'en' | 'ru'

const EMPTY_FORM: BlogCategoryFormData = {
  label_es: '',
  label_en: '',
  label_ru: '',
  description_es: '',
  description_en: '',
  description_ru: '',
  sort_order: 0,
  active: true,
}

function toForm(c: BlogCategory): BlogCategoryFormData {
  return {
    label_es: c.label_es,
    label_en: c.label_en,
    label_ru: c.label_ru,
    description_es: c.description_es,
    description_en: c.description_en,
    description_ru: c.description_ru,
    sort_order: c.sort_order,
    active: c.active,
  }
}

export function BlogCategoryTable() {
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<BlogCategoryFormData>(EMPTY_FORM)
  const [activeLocale, setActiveLocale] = useState<FormLocale>('es')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(ADMIN_API_ROUTES.blogCategories)
      if (res.ok) {
        const data = await res.json()
        setCategories(data.data ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  function startCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setActiveLocale('es')
    setError('')
    setShowForm(true)
  }

  function startEdit(c: BlogCategory) {
    setEditingId(c.id)
    setForm(toForm(c))
    setActiveLocale('es')
    setError('')
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  function updateField<K extends keyof BlogCategoryFormData>(key: K, value: BlogCategoryFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = editingId
        ? ADMIN_API_ROUTES.blogCategoryById(editingId)
        : ADMIN_API_ROUTES.blogCategories
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al guardar')
      }
      cancelForm()
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(c: BlogCategory) {
    if (!window.confirm(`¿Eliminar la categoría "${c.label_es}"?`)) return
    try {
      const res = await fetch(ADMIN_API_ROUTES.blogCategoryById(c.id), { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        window.alert(data.error || 'Error al eliminar')
        return
      }
      fetchCategories()
    } catch {
      window.alert('Error al eliminar')
    }
  }

  const labelField = `label_${activeLocale}` as const
  const descField = `description_${activeLocale}` as const

  return (
    <div>
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
        <div className="ds-flex ds-items-center ds-gap-3">
          <Link href={ADMIN_ROUTES.blog} className="ds-btn ds-btn--ghost ds-btn--sm">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="ds-font-display ds-text-2xl ds-font-bold ds-text-primary">
            Categorías del blog
          </h1>
        </div>
        {!showForm && (
          <button type="button" onClick={startCreate} className="ds-btn ds-btn--lg">
            <Plus size={18} />
            <span className="ds-ml-2">Nueva categoría</span>
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="ds-card ds-mb-6">
          <div className="ds-card__header ds-flex ds-justify-between ds-items-center">
            <h2 className="ds-card__title">
              {editingId ? 'Editar categoría' : 'Nueva categoría'}
            </h2>
            <LocalePills value={activeLocale} onChange={setActiveLocale} />
          </div>
          <div className="ds-card__body">
            {error && <div className="ds-alert ds-alert--error ds-mb-4">{error}</div>}
            <div className="ds-form">
              <div>
                <label className="ds-label">Nombre ({activeLocale.toUpperCase()})</label>
                <input
                  type="text"
                  className="ds-input ds-input--lg"
                  value={form[labelField]}
                  onChange={(e) =>
                    updateField(labelField, e.target.value as BlogCategoryFormData[typeof labelField])
                  }
                  required={activeLocale === 'es'}
                />
              </div>
              <div>
                <label className="ds-label">Descripción ({activeLocale.toUpperCase()})</label>
                <textarea
                  className="ds-textarea"
                  value={form[descField]}
                  onChange={(e) =>
                    updateField(descField, e.target.value as BlogCategoryFormData[typeof descField])
                  }
                  rows={3}
                />
              </div>
              <div className="ds-grid ds-grid-cols-2 ds-gap-4">
                <div>
                  <label className="ds-label">Orden</label>
                  <input
                    type="number"
                    className="ds-input ds-input--lg"
                    value={form.sort_order}
                    onChange={(e) => updateField('sort_order', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="ds-label">Activa</label>
                  <label className="ds-checkbox">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => updateField('active', e.target.checked)}
                    />
                    <span>Visible en el sitio</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="ds-card__footer ds-flex ds-justify-end ds-gap-2">
            <button type="button" onClick={cancelForm} className="ds-btn ds-btn--secondary">
              <X size={16} />
              <span className="ds-ml-2">Cancelar</span>
            </button>
            <button type="submit" disabled={saving} className="ds-btn">
              {saving ? <Loader2 size={16} className="ds-animate-spin" /> : <Save size={16} />}
              <span className="ds-ml-2">{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="ds-card">
        <div className="ds-table-wrapper">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>EN</th>
                <th>RU</th>
                <th>Orden</th>
                <th>Estado</th>
                <th className="vip-blog-table__actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">Cargando...</span>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">No hay categorías.</span>
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id}>
                    <td className="ds-font-medium">{c.label_es}</td>
                    <td className="ds-text-secondary">{c.slug}</td>
                    <td className="ds-text-secondary">{c.label_en || '—'}</td>
                    <td className="ds-text-secondary">{c.label_ru || '—'}</td>
                    <td>{c.sort_order}</td>
                    <td>
                      <span className={`ds-badge ${c.active ? 'ds-badge--success' : 'ds-badge--outline'}`}>
                        {c.active ? 'Activa' : 'Oculta'}
                      </span>
                    </td>
                    <td>
                      <div className="ds-flex ds-gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="ds-btn ds-btn--icon ds-btn--ghost ds-btn--sm"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="ds-btn ds-btn--icon ds-btn--ghost ds-btn--sm ds-text-error"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
