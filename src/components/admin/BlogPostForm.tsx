'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'
import { CustomSelect } from '@digiko-npm/cms/ui'
import { LocalePills } from '@/components/admin/LocalePills'
import { BlogContentEditor } from '@/components/admin/BlogContentEditor'
import { BlogCoverPicker } from '@/components/admin/BlogCoverPicker'
import type { UnsplashSelection } from '@/components/admin/UnsplashPicker'
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from '@/config/routes'
import type { BlogCategory, BlogPostFormData, BlogPostWithCategory, BlogStatus } from '@/types/blog'

type FormLocale = 'es' | 'en' | 'ru'

interface BlogPostFormProps {
  post?: BlogPostWithCategory
  categories: BlogCategory[]
}

const STATUS_OPTIONS: { value: BlogStatus; label: string }[] = [
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Archivado' },
]

const TITLE_PLACEHOLDERS: Record<FormLocale, string> = {
  es: 'Ej: 5 consejos para comprar tu primer piso',
  en: 'e.g.: 5 tips for buying your first apartment',
  ru: 'Напр.: 5 советов для покупки первой квартиры',
}

const EXCERPT_PLACEHOLDERS: Record<FormLocale, string> = {
  es: 'Resumen breve que aparece en las tarjetas...',
  en: 'Short summary shown in cards...',
  ru: 'Краткое описание для карточек...',
}

function toFormData(p?: BlogPostWithCategory): BlogPostFormData {
  if (!p) {
    return {
      category_id: null,
      title_es: '',
      title_en: '',
      title_ru: '',
      excerpt_es: '',
      excerpt_en: '',
      excerpt_ru: '',
      content_es: '',
      content_en: '',
      content_ru: '',
      cover_image_url: '',
      cover_thumb_url: '',
      cover_blur_hash: null,
      cover_alt: '',
      cover_photographer_name: '',
      cover_photographer_url: '',
      cover_photo_page_url: '',
      cover_unsplash_id: null,
      status: 'draft',
      featured: false,
    }
  }
  return {
    category_id: p.category_id,
    title_es: p.title_es,
    title_en: p.title_en,
    title_ru: p.title_ru,
    excerpt_es: p.excerpt_es,
    excerpt_en: p.excerpt_en,
    excerpt_ru: p.excerpt_ru,
    content_es: p.content_es,
    content_en: p.content_en,
    content_ru: p.content_ru,
    cover_image_url: p.cover_image_url,
    cover_thumb_url: p.cover_thumb_url,
    cover_blur_hash: p.cover_blur_hash,
    cover_alt: p.cover_alt,
    cover_photographer_name: p.cover_photographer_name,
    cover_photographer_url: p.cover_photographer_url,
    cover_photo_page_url: p.cover_photo_page_url,
    cover_unsplash_id: p.cover_unsplash_id,
    status: p.status,
    featured: p.featured,
  }
}

export function BlogPostForm({ post, categories }: BlogPostFormProps) {
  const router = useRouter()
  const isEdit = !!post
  const [form, setForm] = useState<BlogPostFormData>(() => toFormData(post))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeLocale, setActiveLocale] = useState<FormLocale>('es')

  const categoryOptions = [
    { value: '', label: 'Sin categoría' },
    ...categories.map((c) => ({ value: c.id, label: c.label_es })),
  ]

  function updateField<K extends keyof BlogPostFormData>(key: K, value: BlogPostFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateLocalized(prefix: 'title' | 'excerpt', locale: FormLocale, value: string) {
    setForm((prev) => ({ ...prev, [`${prefix}_${locale}`]: value }))
  }

  function updateContent(locale: FormLocale, html: string) {
    setForm((prev) => ({ ...prev, [`content_${locale}`]: html }))
  }

  function updateCover(selection: UnsplashSelection) {
    setForm((prev) => ({ ...prev, ...selection }))
  }

  const titleField = `title_${activeLocale}` as const
  const excerptField = `excerpt_${activeLocale}` as const

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url = isEdit ? ADMIN_API_ROUTES.blogPostById(post!.id) : ADMIN_API_ROUTES.blogPosts
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error al guardar el artículo')
      }
      router.push(ADMIN_ROUTES.blog)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  const currentSelection: UnsplashSelection = {
    cover_image_url: form.cover_image_url,
    cover_thumb_url: form.cover_thumb_url,
    cover_blur_hash: form.cover_blur_hash,
    cover_alt: form.cover_alt,
    cover_photographer_name: form.cover_photographer_name,
    cover_photographer_url: form.cover_photographer_url,
    cover_photo_page_url: form.cover_photo_page_url,
    cover_unsplash_id: form.cover_unsplash_id,
  }

  return (
    <form onSubmit={handleSubmit} className="vip-blog-form" autoComplete="off">
      {/* Header */}
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-6">
        <div className="ds-flex ds-items-center ds-gap-3">
          <button
            type="button"
            onClick={() => router.push(ADMIN_ROUTES.blog)}
            className="ds-btn ds-btn--ghost ds-btn--sm"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="ds-section-title">
            {isEdit ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h1>
        </div>
        <button type="submit" className="ds-btn" disabled={saving}>
          {saving ? <Loader2 size={18} className="ds-animate-spin" /> : <Save size={18} />}
          <span className="ds-ml-2">{saving ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>

      {error && <div className="ds-alert ds-alert--error ds-mb-4">{error}</div>}

      <div className="vip-blog-form__layout">
        {/* ─── Main Column ─── */}
        <div className="vip-blog-form__main">
          {/* Title + Excerpt */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header ds-flex ds-justify-between ds-items-center">
              <h2 className="ds-card__title">Contenido</h2>
              <LocalePills value={activeLocale} onChange={setActiveLocale} />
            </div>
            <div className="ds-card__body">
              <div className="ds-form">
                <div>
                  <label className="ds-label">Título</label>
                  <input
                    type="text"
                    className="ds-input ds-input--lg"
                    value={form[titleField]}
                    onChange={(e) => updateLocalized('title', activeLocale, e.target.value)}
                    placeholder={TITLE_PLACEHOLDERS[activeLocale]}
                    required={activeLocale === 'es'}
                  />
                </div>
                <div>
                  <label className="ds-label">Extracto</label>
                  <textarea
                    className="ds-textarea"
                    value={form[excerptField]}
                    onChange={(e) => updateLocalized('excerpt', activeLocale, e.target.value)}
                    placeholder={EXCERPT_PLACEHOLDERS[activeLocale]}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="ds-label">Cuerpo del artículo</label>
                  <BlogContentEditor
                    value={{ es: form.content_es, en: form.content_en, ru: form.content_ru }}
                    onChange={updateContent}
                    activeLocale={activeLocale}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Sidebar Column ─── */}
        <div className="vip-blog-form__sidebar">
          {/* Status & Visibility */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Publicación</h2>
            </div>
            <div className="ds-card__body">
              <div className="ds-form">
                <div>
                  <CustomSelect
                    options={STATUS_OPTIONS}
                    value={form.status}
                    onChange={(v) => updateField('status', v as BlogStatus)}
                    label="Estado"
                    size="lg"
                    searchable={false}
                  />
                </div>
                <div>
                  <CustomSelect
                    options={categoryOptions}
                    value={form.category_id ?? ''}
                    onChange={(v) => updateField('category_id', v || null)}
                    label="Categoría"
                    placeholder="Sin categoría"
                    size="lg"
                  />
                </div>
                <label className="ds-checkbox">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateField('featured', e.target.checked)}
                  />
                  <span>Destacado</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div className="ds-card ds-mb-4">
            <div className="ds-card__header">
              <h2 className="ds-card__title">Imagen de portada</h2>
            </div>
            <div className="ds-card__body">
              <BlogCoverPicker value={currentSelection} onChange={updateCover} />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
