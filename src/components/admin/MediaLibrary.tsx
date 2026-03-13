'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Upload, Trash2, Copy, Check, ChevronLeft, ChevronRight, Image as ImageIcon, Film } from 'lucide-react'
import { MediaUploader } from '@digiko-npm/cms/media'
import { ADMIN_API_ROUTES } from '@/config/routes'
import { MEDIA_CONFIG } from '@/config/media'
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

const ITEMS_PER_PAGE = 24

const uploadConfig = {
  uploadEndpoint: ADMIN_API_ROUTES.mediaPresign,
  mediaEndpoint: ADMIN_API_ROUTES.media,
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function MediaLibrary() {
  const [items, setItems] = useState<MediaRecord[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showUploader, setShowUploader] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selected, setSelected] = useState<MediaRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
    })
    if (search) params.set('search', search)
    if (filterType) params.set('type', filterType)

    try {
      const res = await fetch(`${ADMIN_API_ROUTES.media}?${params}`)
      if (res.ok) {
        const data: MediaListResult = await res.json()
        setItems(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, filterType])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  useEffect(() => {
    setPage(1)
  }, [search, filterType])

  function handleUploadComplete() {
    setShowUploader(false)
    fetchMedia()
  }

  async function handleCopyUrl(item: MediaRecord) {
    await navigator.clipboard.writeText(item.url)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(item: MediaRecord) {
    setDeleting(true)
    try {
      const res = await fetch(`${ADMIN_API_ROUTES.media}?id=${item.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setSelected(null)
        fetchMedia()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-4">
        Media
      </h1>

      {/* Toolbar */}
      <div className="ds-flex ds-flex-wrap ds-gap-3 ds-items-center ds-mb-4">
        <div className="ds-input-group ds-flex-1" style={{ minWidth: 200 }}>
          <div className="ds-input-group__icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="ds-input ds-input--lg"
            placeholder="Buscar archivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="ds-select ds-input--lg"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">Todos</option>
          <option value="image">Imágenes</option>
          <option value="video">Vídeos</option>
        </select>

        <button
          type="button"
          onClick={() => setShowUploader(!showUploader)}
          className="ds-btn ds-btn--lg"
        >
          <Upload size={18} />
          <span className="ds-ml-2">Subir</span>
        </button>
      </div>

      {/* Uploader area */}
      {showUploader && (
        <div className="ds-card ds-mb-4">
          <div className="ds-card__body">
            <MediaUploader
              uploadConfig={uploadConfig}
              folder={MEDIA_CONFIG.paths.general}
              accept={[...MEDIA_CONFIG.allowedImageTypes, ...MEDIA_CONFIG.allowedVideoTypes].join(',')}
              onUpload={handleUploadComplete}
              className="cx-image-uploader"
            />
          </div>
        </div>
      )}

      <div className="ds-flex ds-gap-4">
        {/* Grid */}
        <div className="ds-flex-1">
          {loading ? (
            <div className="ds-card">
              <div className="ds-card__body ds-text-center ds-py-12">
                <span className="ds-text-secondary">Cargando...</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="ds-card">
              <div className="ds-card__body ds-text-center ds-py-12">
                <ImageIcon size={48} className="ds-text-tertiary ds-mx-auto ds-mb-3" />
                <p className="ds-text-secondary">
                  {search || filterType ? 'No se encontraron archivos.' : 'Biblioteca vacía. Sube tu primer archivo.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="ds-grid ds-grid-cols-2 ds-md:grid-cols-4 ds-lg:grid-cols-6 ds-gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(selected?.id === item.id ? null : item)}
                    className={cn(
                      'cx-media-item ds-rounded-lg ds-overflow-hidden ds-border ds-bg-surface',
                      selected?.id === item.id && 'cx-media-item--selected'
                    )}
                  >
                    <div className="ds-aspect-square ds-bg-elevated ds-flex ds-items-center ds-justify-center ds-overflow-hidden">
                      {item.mime_type.startsWith('image/') ? (
                        <img
                          src={item.url}
                          alt={item.alt_text || item.original_name}
                          className="ds-w-full ds-h-full"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Film size={32} className="ds-text-tertiary" />
                      )}
                    </div>
                    <div className="ds-p-2">
                      <p className="ds-text-xs ds-text-primary ds-font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.original_name}
                      </p>
                      <p className="ds-text-xs ds-text-tertiary">
                        {formatFileSize(item.size_bytes)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="ds-flex ds-justify-between ds-items-center ds-mt-4">
                  <span className="ds-text-sm ds-text-secondary">
                    {total} archivo{total !== 1 ? 's' : ''}
                  </span>
                  <div className="ds-flex ds-gap-2 ds-items-center">
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
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="cx-media-detail ds-card" style={{ width: 280, flexShrink: 0 }}>
            <div className="ds-card__body ds-flex ds-flex-col ds-gap-4">
              {/* Preview */}
              <div className="ds-aspect-video ds-bg-elevated ds-rounded-lg ds-overflow-hidden ds-flex ds-items-center ds-justify-center">
                {selected.mime_type.startsWith('image/') ? (
                  <img
                    src={selected.url}
                    alt={selected.alt_text || selected.original_name}
                    className="ds-w-full ds-h-full"
                    style={{ objectFit: 'contain' }}
                  />
                ) : (
                  <Film size={48} className="ds-text-tertiary" />
                )}
              </div>

              {/* Info */}
              <div className="ds-flex ds-flex-col ds-gap-2">
                <p className="ds-text-sm ds-font-medium ds-text-primary" style={{ wordBreak: 'break-all' }}>
                  {selected.original_name}
                </p>
                <div className="ds-text-xs ds-text-secondary ds-flex ds-flex-col ds-gap-1">
                  <span>{selected.mime_type}</span>
                  <span>{formatFileSize(selected.size_bytes)}</span>
                  {selected.width && selected.height && (
                    <span>{selected.width} x {selected.height}px</span>
                  )}
                  <span>{formatDate(selected.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="ds-flex ds-flex-col ds-gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selected)}
                  className="ds-btn ds-btn--secondary ds-btn--sm"
                >
                  {copiedId === selected.id ? <Check size={14} /> : <Copy size={14} />}
                  <span className="ds-ml-2">
                    {copiedId === selected.id ? 'Copiado' : 'Copiar URL'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selected)}
                  className="ds-btn ds-btn--danger ds-btn--sm"
                  disabled={deleting}
                >
                  <Trash2 size={14} />
                  <span className="ds-ml-2">{deleting ? 'Eliminando...' : 'Eliminar'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
