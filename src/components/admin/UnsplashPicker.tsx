'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search, Loader2, X, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import { ADMIN_API_ROUTES } from '@/config/routes'
import type { UnsplashPhoto, UnsplashSearchResponse } from '@/types/blog'
import { cn } from '@/lib/utils'

export interface UnsplashSelection {
  cover_image_url: string
  cover_thumb_url: string
  cover_blur_hash: string | null
  cover_alt: string
  cover_photographer_name: string
  cover_photographer_url: string
  cover_photo_page_url: string
  cover_unsplash_id: string | null
}

interface UnsplashPickerProps {
  value: UnsplashSelection
  onChange: (selection: UnsplashSelection) => void
}

const EMPTY_SELECTION: UnsplashSelection = {
  cover_image_url: '',
  cover_thumb_url: '',
  cover_blur_hash: null,
  cover_alt: '',
  cover_photographer_name: '',
  cover_photographer_url: '',
  cover_photo_page_url: '',
  cover_unsplash_id: null,
}

export function UnsplashPicker({ value, onChange }: UnsplashPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnsplashPhoto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasSelection = !!value.cover_image_url

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ q, page: '1' })
      const res = await fetch(`${ADMIN_API_ROUTES.unsplashSearch}?${params}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Error de búsqueda')
      }
      const data: UnsplashSearchResponse = await res.json()
      setResults(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query)
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  function selectPhoto(photo: UnsplashPhoto) {
    onChange({
      cover_image_url: photo.url_regular,
      cover_thumb_url: photo.url_small,
      cover_blur_hash: photo.blur_hash,
      cover_alt: photo.alt,
      cover_photographer_name: photo.photographer_name,
      cover_photographer_url: photo.photographer_url,
      cover_photo_page_url: photo.photo_page_url,
      cover_unsplash_id: photo.id,
    })
    setQuery('')
    setResults([])
  }

  function clearSelection() {
    onChange(EMPTY_SELECTION)
  }

  return (
    <div className="vip-unsplash-picker">
      {hasSelection && (
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
      )}

      {!hasSelection && (
        <>
          <div className="ds-input-group">
            <div className="ds-input-group__icon">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="ds-input ds-input--lg"
              placeholder="Buscar en Unsplash..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && <div className="ds-alert ds-alert--error ds-mt-3">{error}</div>}

          {loading && (
            <div className="vip-unsplash-picker__loading">
              <Loader2 size={20} className="ds-animate-spin" />
              <span className="ds-ml-2 ds-text-secondary">Buscando...</span>
            </div>
          )}

          {!loading && query.trim().length < 2 && (
            <div className="vip-unsplash-picker__empty">
              <ImagePlus size={32} />
              <p className="ds-text-sm ds-text-secondary ds-mt-2">
                Escribe al menos 2 caracteres para buscar.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="vip-unsplash-picker__grid">
              {results.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => selectPhoto(photo)}
                  className={cn('vip-unsplash-picker__thumb')}
                  title={`${photo.photographer_name} on Unsplash`}
                >
                  <Image
                    src={photo.url_thumb}
                    alt={photo.alt}
                    fill
                    sizes="200px"
                    className="vip-unsplash-picker__thumb-img"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && !error && (
            <div className="vip-unsplash-picker__empty">
              <p className="ds-text-sm ds-text-secondary">Sin resultados.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { EMPTY_SELECTION as EMPTY_UNSPLASH_SELECTION }
