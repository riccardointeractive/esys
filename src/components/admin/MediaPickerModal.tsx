'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { ADMIN_API_ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'

interface MediaRecord {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  width?: number | null
  height?: number | null
  alt_text?: string | null
  created_at: string
}

interface MediaListResult {
  items: MediaRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface MediaPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (urls: string[]) => void
  excludeUrls: string[]
  maxSelectable: number
}

const ITEMS_PER_PAGE = 18

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  excludeUrls,
  maxSelectable,
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaRecord[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const excludeSet = new Set(excludeUrls)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
      type: 'image',
    })
    if (search) params.set('search', search)

    try {
      const res = await fetch(`${ADMIN_API_ROUTES.media}?${params}`)
      if (res.ok) {
        const data: MediaListResult = await res.json()
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
    setPage(1)
  }, [search])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelected(new Set())
      setSearch('')
      setPage(1)
    }
  }, [open])

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(url)) {
        next.delete(url)
      } else if (next.size < maxSelectable) {
        next.add(url)
      }
      return next
    })
  }

  function handleConfirm() {
    onSelect(Array.from(selected))
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="ds-modal ds-modal--open ds-modal--lg"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="ds-modal__content" style={{ maxHeight: '85dvh' }}>
        {/* Header */}
        <div className="ds-modal__header">
          <div>
            <h3>Seleccionar de la biblioteca</h3>
            {maxSelectable < Infinity && (
              <p>
                {selected.size} seleccionada{selected.size !== 1 ? 's' : ''}
                {' · '}máx. {maxSelectable}
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="ds-modal__close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="ds-modal__body">
          {/* Search */}
          <div className="ds-input-group ds-mb-4">
            <div className="ds-input-group__icon">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="ds-input"
              placeholder="Buscar imágenes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="ds-text-center ds-py-12">
              <span className="ds-text-secondary">Cargando...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="ds-text-center ds-py-12">
              <span className="ds-text-secondary">No se encontraron imágenes</span>
            </div>
          ) : (
            <div className="ds-grid ds-grid-cols-2 ds-md:grid-cols-3 ds-lg:grid-cols-5 ds-gap-3">
              {items.map((item) => {
                const isExcluded = excludeSet.has(item.url)
                const isSelected = selected.has(item.url)
                const isDisabled = isExcluded || (!isSelected && selected.size >= maxSelectable)

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => !isExcluded && toggleSelect(item.url)}
                    disabled={isDisabled}
                    className={cn(
                      'ds-rounded-lg ds-overflow-hidden ds-border ds-bg-surface',
                      'ds-relative',
                      isSelected && 'vip-media-item--selected',
                      isExcluded && 'ds-opacity-40'
                    )}
                    style={{ cursor: isExcluded ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="ds-aspect-square ds-bg-elevated ds-overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.alt_text || item.original_name}
                        className="ds-w-full ds-h-full"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>

                    {/* Selection indicator */}
                    {isSelected && (
                      <div
                        className="ds-flex ds-items-center ds-justify-center"
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: 'var(--ds-color-interactive)',
                          color: '#fff',
                        }}
                      >
                        <Check size={14} />
                      </div>
                    )}

                    {/* Already assigned badge */}
                    {isExcluded && (
                      <div className="ds-p-1 ds-text-center">
                        <span className="ds-text-xs ds-text-tertiary">Ya asignada</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Pagination */}
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
              <span className="ds-text-sm">{page} / {totalPages}</span>
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

        {/* Footer */}
        <div className="ds-modal__footer">
          <button type="button" onClick={onClose} className="ds-btn ds-btn--ghost">
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="ds-btn"
          >
            Añadir {selected.size > 0 ? `${selected.size} imagen${selected.size !== 1 ? 'es' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
