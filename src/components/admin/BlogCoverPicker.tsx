'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Loader2, ImagePlus, Search, X, Library, Sparkles } from 'lucide-react'
import { UnsplashPicker, type UnsplashSelection, EMPTY_UNSPLASH_SELECTION } from '@/components/admin/UnsplashPicker'
import { BlogMediaPickerModal, type BlogMediaSelection } from '@/components/admin/BlogMediaPickerModal'
import { uploadBlogImage } from '@/lib/blog-upload'
import { cn } from '@/lib/utils'

type Tab = 'unsplash' | 'upload' | 'library'

interface BlogCoverPickerProps {
  value: UnsplashSelection
  onChange: (selection: UnsplashSelection) => void
}

export function BlogCoverPicker({ value, onChange }: BlogCoverPickerProps) {
  const [tab, setTab] = useState<Tab>('unsplash')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasSelection = !!value.cover_image_url

  function clearSelection() {
    onChange(EMPTY_UNSPLASH_SELECTION)
    setUploadError('')
  }

  async function handleFile(file: File) {
    setUploadError('')
    setUploading(true)
    try {
      const result = await uploadBlogImage(file)
      onChange({
        cover_image_url: result.url,
        cover_thumb_url: result.url,
        cover_blur_hash: null,
        cover_alt: file.name.replace(/\.[a-z0-9]+$/i, ''),
        cover_photographer_name: '',
        cover_photographer_url: '',
        cover_photo_page_url: '',
        cover_unsplash_id: null,
      })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  function onLibraryPick(item: BlogMediaSelection) {
    onChange({
      cover_image_url: item.url,
      cover_thumb_url: item.url,
      cover_blur_hash: null,
      cover_alt: item.alt,
      cover_photographer_name: '',
      cover_photographer_url: '',
      cover_photo_page_url: '',
      cover_unsplash_id: null,
    })
  }

  // If a cover is already set, show the preview with a "Cambiar" affordance.
  if (hasSelection) {
    return (
      <div className="vip-blog-cover-picker">
        <div className="vip-unsplash-picker__selected">
          <div className="vip-unsplash-picker__preview">
            <Image
              src={value.cover_image_url}
              alt={value.cover_alt || ''}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="vip-unsplash-picker__preview-img"
              unoptimized
            />
          </div>
          <div className="vip-unsplash-picker__credit">
            {value.cover_photographer_name ? (
              <span className="ds-text-sm ds-text-secondary">
                Foto de{' '}
                <a
                  href={value.cover_photographer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-text-interactive"
                >
                  {value.cover_photographer_name}
                </a>{' '}
                en{' '}
                <a
                  href={value.cover_photo_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ds-text-interactive"
                >
                  Unsplash
                </a>
              </span>
            ) : (
              <span className="ds-text-sm ds-text-tertiary">Imagen propia</span>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="ds-btn ds-btn--ghost ds-btn--sm"
            >
              <X size={14} />
              <span className="ds-ml-2">Cambiar</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="vip-blog-cover-picker">
      {/* Tabs */}
      <div className="vip-blog-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'unsplash'}
          onClick={() => setTab('unsplash')}
          className={cn('vip-blog-tab', tab === 'unsplash' && 'vip-blog-tab--active')}
        >
          <Sparkles size={14} />
          <span className="ds-ml-2">Unsplash</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'upload'}
          onClick={() => setTab('upload')}
          className={cn('vip-blog-tab', tab === 'upload' && 'vip-blog-tab--active')}
        >
          <ImagePlus size={14} />
          <span className="ds-ml-2">Subir</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'library'}
          onClick={() => setTab('library')}
          className={cn('vip-blog-tab', tab === 'library' && 'vip-blog-tab--active')}
        >
          <Library size={14} />
          <span className="ds-ml-2">Biblioteca</span>
        </button>
      </div>

      {/* Panels */}
      <div className="vip-blog-tabs__panel">
        {tab === 'unsplash' && <UnsplashPicker value={value} onChange={onChange} />}

        {tab === 'upload' && (
          <div className="vip-blog-upload">
            <button
              type="button"
              className="vip-blog-upload__dropzone"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={32} className="ds-animate-spin" />
                  <span className="ds-mt-3 ds-text-secondary">Subiendo...</span>
                </>
              ) : (
                <>
                  <ImagePlus size={32} />
                  <span className="ds-mt-3 ds-text-secondary">
                    Click para seleccionar una imagen
                  </span>
                  <span className="ds-text-xs ds-text-tertiary ds-mt-1">
                    JPG, PNG, WebP o AVIF — máx 10 MB
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) handleFile(file)
              }}
              className="vip-rte__file-input"
            />
            {uploadError && (
              <div className="ds-alert ds-alert--error ds-mt-3">{uploadError}</div>
            )}
          </div>
        )}

        {tab === 'library' && (
          <div className="vip-blog-library-tab">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="ds-btn ds-btn--lg ds-btn--full"
            >
              <Search size={16} />
              <span className="ds-ml-2">Abrir biblioteca del blog</span>
            </button>
            <p className="ds-text-xs ds-text-tertiary ds-mt-2">
              Solo imágenes ya subidas en artículos del blog. La biblioteca del cliente
              está separada y no aparece aquí.
            </p>
          </div>
        )}
      </div>

      <BlogMediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={onLibraryPick}
      />
    </div>
  )
}
