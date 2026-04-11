'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ADMIN_API_ROUTES } from '@/config/routes'

interface BlogMediaRecord {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  width: number | null
  height: number | null
  alt_text: string | null
  created_at: string
}

interface BlogMediaListResult {
  items: BlogMediaRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BlogMediaSelection {
  url: string
  alt: string
  width?: number
  height?: number
}

interface BlogMediaPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (item: BlogMediaSelection) => void
}

const ITEMS_PER_PAGE = 18

export function BlogMediaPickerModal({ open, onClose, onSelect }: BlogMediaPickerModalProps) {
  const [items, setItems] = useState<BlogMediaRecord[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
      type: 'image',
    })
    if (search) params.set('search', search)
    try {
      const res = await fetch(`${ADMIN_API_ROUTES.blogMedia}?${params}`)
      if (res.ok) {
        const data: BlogMediaListResult = await res.json()
        setItems(data.items)
        setTotalPages(data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    if (open) fetchMedia()
  }, [open, fetchMedia])

  useEffect(() => {
    if (open) {
      setPage(1)
      setSearch('')
    }
  }, [open])

  if (!open) return null

  function handlePick(item: BlogMediaRecord) {
    onSelect({
      url: item.url,
      alt: item.alt_text ?? item.original_name ?? '',
      width: item.width ?? undefined,
      height: item.height ?? undefined,
    })
    onClose()
  }

  return (
    <div
      className="ds-modal ds-modal--open ds-modal--lg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="ds-modal__content vip-blog-picker-modal">
        <div className="ds-modal__header">
          <h3>Biblioteca del blog</h3>
          <button type="button" onClick={onClose} className="ds-modal__close">
            <X size={20} />
          </button>
        </div>

        <div className="ds-modal__body">
          <div className="ds-input-group ds-mb-4">
            <div className="ds-input-group__icon">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="ds-input"
              placeholder="Buscar en el blog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
            />
          </div>

          {loading ? (
            <div className="vip-blog-picker-modal__state">
              <Loader2 size={20} className="ds-animate-spin" />
              <span className="ds-ml-2 ds-text-secondary">Cargando...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="vip-blog-picker-modal__state">
              <span className="ds-text-secondary">
                Sin imágenes en la biblioteca del blog. Sube la primera con la pestaña Subir.
              </span>
            </div>
          ) : (
            <div className="vip-blog-picker-modal__grid">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePick(item)}
                  className="vip-blog-picker-modal__thumb"
                  title={item.original_name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt_text || item.original_name}
                    className="vip-blog-picker-modal__thumb-img"
                  />
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="ds-flex ds-justify-center ds-items-center ds-gap-3 ds-mt-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="ds-btn ds-btn--ghost ds-btn--sm"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="ds-text-sm">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="ds-btn ds-btn--ghost ds-btn--sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
