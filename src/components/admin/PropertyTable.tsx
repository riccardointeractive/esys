'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { DeletePropertyModal } from '@/components/admin/DeletePropertyModal'
import { PROPERTY_TYPES, PROPERTY_STATUS, PROPERTY_CATEGORY } from '@/config/property'
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { Property, PropertyListResponse } from '@/types/property'

const statusEntries = Object.entries(PROPERTY_STATUS)
const categoryEntries = Object.entries(PROPERTY_CATEGORY)
const typeEntries = Object.entries(PROPERTY_TYPES)

const ITEMS_PER_PAGE = 20

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'available': return 'ds-badge--success'
    case 'reserved': return 'ds-badge--warning'
    case 'sold': return 'ds-badge--error'
    default: return ''
  }
}

export function PropertyTable() {
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterType, setFilterType] = useState('')

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
    })
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    if (filterCategory) params.set('category', filterCategory)
    if (filterType) params.set('type', filterType)

    try {
      const res = await fetch(`${ADMIN_API_ROUTES.properties}?${params}`)
      if (res.ok) {
        const data: PropertyListResponse = await res.json()
        setProperties(data.data)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus, filterCategory, filterType])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, filterStatus, filterCategory, filterType])

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(ADMIN_API_ROUTES.propertyById(deleteTarget.id), {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteTarget(null)
        fetchProperties()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-4">
        Propiedades
      </h1>

      {/* Toolbar: search + filters + action */}
      <div className="ds-flex ds-flex-wrap ds-gap-3 ds-items-center ds-mb-4">
        <div className="ds-input-group ds-flex-1" style={{ minWidth: 200 }}>
          <div className="ds-input-group__icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="ds-input ds-input--lg"
            placeholder="Título, ciudad, dirección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            data-1p-ignore
            data-lpignore="true"
          />
        </div>

        <select
          className="ds-select ds-input--lg"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">Estado</option>
          {statusEntries.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="ds-select ds-input--lg"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">Categoría</option>
          {categoryEntries.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          className="ds-select ds-input--lg"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="">Tipo</option>
          {typeEntries.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <Link href={ADMIN_ROUTES.propertyNew} className="ds-btn ds-btn--lg">
          <Plus size={18} />
          <span className="ds-ml-2">Nueva Propiedad</span>
        </Link>
      </div>

      {/* Table */}
      <div className="ds-card">
        <div className="ds-table-wrapper">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Categoría</th>
                <th>Ciudad</th>
                <th style={{ width: 100 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">Cargando...</span>
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">No hay propiedades.</span>
                  </td>
                </tr>
              ) : (
                properties.map((prop) => (
                  <tr key={prop.id}>
                    <td>
                      <div>
                        <Link
                          href={ADMIN_ROUTES.propertyEdit.replace('[id]', prop.id)}
                          className="ds-text-interactive ds-font-medium"
                        >
                          {prop.title}
                        </Link>
                        {!prop.published && (
                          <span className="ds-badge ds-badge--secondary ds-ml-2">Borrador</span>
                        )}
                        {prop.featured && (
                          <span className="ds-badge ds-badge--info ds-ml-2">Destacada</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {PROPERTY_TYPES[prop.type as keyof typeof PROPERTY_TYPES] || prop.type}
                    </td>
                    <td className="ds-font-medium">{formatPrice(prop.price)}</td>
                    <td>
                      <span className={cn('ds-badge', getStatusBadgeClass(prop.status))}>
                        {PROPERTY_STATUS[prop.status as keyof typeof PROPERTY_STATUS] || prop.status}
                      </span>
                    </td>
                    <td>
                      {PROPERTY_CATEGORY[prop.category as keyof typeof PROPERTY_CATEGORY] || prop.category}
                    </td>
                    <td className="ds-text-secondary">{prop.city}</td>
                    <td>
                      <div className="ds-flex ds-gap-1">
                        <Link
                          href={ADMIN_ROUTES.propertyEdit.replace('[id]', prop.id)}
                          className="ds-btn ds-btn--ghost ds-btn--xs"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(prop)}
                          className="ds-btn ds-btn--ghost ds-btn--xs ds-text-error"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ds-card__footer ds-flex ds-justify-between ds-items-center">
            <span className="ds-text-sm ds-text-secondary">
              {total} propiedad{total !== 1 ? 'es' : ''} en total
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
          </div>
        )}
      </div>

      {/* Delete modal */}
      <DeletePropertyModal
        propertyTitle={deleteTarget?.title ?? ''}
        isOpen={!!deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
