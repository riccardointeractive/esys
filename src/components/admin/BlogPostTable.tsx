'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Search,
  ExternalLink,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderTree,
} from 'lucide-react'
import { ADMIN_ROUTES, ADMIN_API_ROUTES } from '@/config/routes'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import type { BlogCategory, BlogPostListResponse, BlogPostWithCategory } from '@/types/blog'

const ITEMS_PER_PAGE = siteConfig.admin.itemsPerPage.blog

function statusBadge(status: string): string {
  switch (status) {
    case 'published':
      return 'ds-badge--success'
    case 'draft':
      return 'ds-badge--outline'
    case 'archived':
      return 'ds-badge--warning'
    default:
      return ''
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'published':
      return 'Publicado'
    case 'draft':
      return 'Borrador'
    case 'archived':
      return 'Archivado'
    default:
      return status
  }
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return '—'
  }
}

interface BlogPostTableProps {
  categories: BlogCategory[]
}

export function BlogPostTable({ categories }: BlogPostTableProps) {
  const [posts, setPosts] = useState<BlogPostWithCategory[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<BlogPostWithCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
    })
    if (search) params.set('search', search)
    if (filterStatus) params.set('status', filterStatus)
    if (filterCategory) params.set('categoryId', filterCategory)
    try {
      const res = await fetch(`${ADMIN_API_ROUTES.blogPosts}?${params}`)
      if (res.ok) {
        const data: BlogPostListResponse = await res.json()
        setPosts(data.data)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, filterStatus, filterCategory])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    setPage(1)
  }, [search, filterStatus, filterCategory])

  async function handleDelete() {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(ADMIN_API_ROUTES.blogPostById(deleteTarget.id), {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteTarget(null)
        fetchPosts()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="ds-section-title ds-mb-4">Blog</h1>

      <div className="ds-flex ds-flex-wrap ds-gap-3 ds-items-center ds-mb-4">
        <div className="ds-input-group ds-flex-1 vip-blog-table__search">
          <div className="ds-input-group__icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="ds-input ds-input--lg"
            placeholder="Buscar por título o slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        <select
          className="ds-select ds-input--lg"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="published">Publicado</option>
          <option value="draft">Borrador</option>
          <option value="archived">Archivado</option>
        </select>

        <select
          className="ds-select ds-input--lg"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label_es}
            </option>
          ))}
        </select>

        <Link href={ADMIN_ROUTES.blogCategories} className="ds-btn ds-btn--outline ds-btn--lg">
          <FolderTree size={18} />
          <span className="ds-ml-2">Categorías</span>
        </Link>

        <Link href={ADMIN_ROUTES.blogNew} className="ds-btn ds-btn--lg">
          <Plus size={18} />
          <span className="ds-ml-2">Nuevo Artículo</span>
        </Link>
      </div>

      <div className="ds-card">
        <div className="ds-table-wrapper">
          <table className="ds-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Publicado</th>
                <th>Vistas</th>
                <th className="vip-blog-table__actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">Cargando...</span>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ds-text-center ds-py-8">
                    <span className="ds-text-secondary">No hay artículos.</span>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link
                        href={ADMIN_ROUTES.blogEdit.replace('[id]', post.id)}
                        className="ds-text-interactive ds-font-medium"
                      >
                        {post.title_es || '(sin título)'}
                      </Link>
                      {post.featured && (
                        <span className="ds-badge ds-badge--info ds-ml-2">Destacado</span>
                      )}
                    </td>
                    <td>{post.category?.label_es ?? '—'}</td>
                    <td>
                      <span className={cn('ds-badge', statusBadge(post.status))}>
                        {statusLabel(post.status)}
                      </span>
                    </td>
                    <td className="ds-text-secondary">{formatDate(post.published_at)}</td>
                    <td className="ds-text-secondary">{post.view_count}</td>
                    <td>
                      <div className="ds-flex ds-gap-1">
                        <a
                          href={`/es/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ds-btn ds-btn--icon ds-btn--ghost ds-btn--sm"
                          title="Ver en sitio"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <Link
                          href={ADMIN_ROUTES.blogEdit.replace('[id]', post.id)}
                          className="ds-btn ds-btn--icon ds-btn--ghost ds-btn--sm"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(post)}
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

        {totalPages > 1 && (
          <div className="ds-card__footer ds-flex ds-justify-between ds-items-center">
            <span className="ds-text-sm ds-text-secondary">{total} artículo(s) en total</span>
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

      {deleteTarget && (
        <div className="ds-modal ds-modal--open">
          <div className="ds-modal__content">
            <div className="ds-modal__header">
              <h3>Eliminar artículo</h3>
            </div>
            <div className="ds-modal__body">
              <p className="ds-text-secondary">
                ¿Eliminar el artículo <strong>{deleteTarget.title_es}</strong>? Esta acción se
                puede revertir desde la base de datos.
              </p>
            </div>
            <div className="ds-modal__footer">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="ds-btn ds-btn--secondary"
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="ds-btn ds-btn--danger"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
