'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ArrowUp, ArrowDown } from 'lucide-react'
import { ADMIN_API_ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { Definition, DefinitionCategory } from '@/types/definition'

interface DefinitionManagerProps {
  category: DefinitionCategory
  initialDefinitions: Definition[]
}

interface EditingState {
  id: string | null
  key: string
  label_es: string
  label_en: string
  label_ru: string
}

const EMPTY_EDIT: EditingState = { id: null, key: '', label_es: '', label_en: '', label_ru: '' }

export function DefinitionManager({ category, initialDefinitions }: DefinitionManagerProps) {
  const [definitions, setDefinitions] = useState<Definition[]>(initialDefinitions)
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [adding, setAdding] = useState(false)
  const [newDef, setNewDef] = useState(EMPTY_EDIT)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* ─── Create ─── */

  async function handleCreate() {
    if (!newDef.key.trim() || !newDef.label_es.trim()) {
      setError('Clave y etiqueta (ES) son obligatorios')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(ADMIN_API_ROUTES.definitions, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          key: newDef.key.trim(),
          label_es: newDef.label_es.trim(),
          label_en: newDef.label_en.trim(),
          label_ru: newDef.label_ru.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear')
      }

      const created = await res.json()
      setDefinitions((prev) => [...prev, created])
      setAdding(false)
      setNewDef(EMPTY_EDIT)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear')
    } finally {
      setLoading(false)
    }
  }

  /* ─── Update ─── */

  async function handleUpdate() {
    if (!editing?.id) return
    if (!editing.label_es.trim()) {
      setError('La etiqueta (ES) es obligatoria')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(ADMIN_API_ROUTES.definitionById(editing.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: editing.key.trim(),
          label_es: editing.label_es.trim(),
          label_en: editing.label_en.trim(),
          label_ru: editing.label_ru.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      const updated = await res.json()
      setDefinitions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  /* ─── Toggle active ─── */

  async function handleToggleActive(def: Definition) {
    try {
      const res = await fetch(ADMIN_API_ROUTES.definitionById(def.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !def.active }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      const updated = await res.json()
      setDefinitions((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado')
    }
  }

  /* ─── Delete ─── */

  async function handleDelete(def: Definition) {
    if (!confirm(`¿Eliminar "${def.label_es}"? Esta acción no se puede deshacer.`)) return

    setError('')

    try {
      const res = await fetch(ADMIN_API_ROUTES.definitionById(def.id), {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar')
      }

      setDefinitions((prev) => prev.filter((d) => d.id !== def.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  /* ─── Reorder ─── */

  async function handleMove(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= definitions.length) return

    const newDefs = [...definitions]
    const temp = newDefs[index]
    newDefs[index] = newDefs[swapIndex]
    newDefs[swapIndex] = temp

    setDefinitions(newDefs)

    // Persist sort_order for both swapped items
    try {
      await Promise.all([
        fetch(ADMIN_API_ROUTES.definitionById(newDefs[index].id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: index }),
        }),
        fetch(ADMIN_API_ROUTES.definitionById(newDefs[swapIndex].id), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sort_order: swapIndex }),
        }),
      ])
    } catch {
      setError('Error al reordenar')
    }
  }

  return (
    <div className="ds-card">
      <div className="ds-card__header ds-flex ds-items-center ds-justify-between">
        <h2 className="ds-text-lg ds-font-semibold">Definiciones</h2>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditing(null); setError('') }}
            className="ds-btn ds-btn--sm"
          >
            <Plus size={16} />
            Añadir
          </button>
        )}
      </div>

      <div className="ds-card__body">
        {error && (
          <div className="ds-alert ds-alert--error ds-mb-4">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="ds-overflow-x-auto">
          <table className="ds-table ds-w-full">
            <thead>
              <tr>
                <th className="ds-text-left ds-text-xs ds-text-secondary ds-font-medium" style={{ width: '2.5rem' }}>#</th>
                <th className="ds-text-left ds-text-xs ds-text-secondary ds-font-medium">Clave</th>
                <th className="ds-text-left ds-text-xs ds-text-secondary ds-font-medium">ES</th>
                <th className="ds-text-left ds-text-xs ds-text-secondary ds-font-medium">EN</th>
                <th className="ds-text-left ds-text-xs ds-text-secondary ds-font-medium">RU</th>
                <th className="ds-text-left ds-text-xs ds-text-secondary ds-font-medium" style={{ width: '5rem' }}>Activo</th>
                <th className="ds-text-right ds-text-xs ds-text-secondary ds-font-medium" style={{ width: '10rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {definitions.map((def, index) => (
                <tr key={def.id} className={cn(!def.active && 'ds-opacity-50')}>
                  {editing?.id === def.id ? (
                    /* ─── Editing row ─── */
                    <>
                      <td className="ds-text-sm ds-text-tertiary">{index + 1}</td>
                      <td>
                        <input
                          className="ds-input ds-input--sm"
                          value={editing.key}
                          onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="ds-input ds-input--sm"
                          value={editing.label_es}
                          onChange={(e) => setEditing({ ...editing, label_es: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="ds-input ds-input--sm"
                          value={editing.label_en}
                          onChange={(e) => setEditing({ ...editing, label_en: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="ds-input ds-input--sm"
                          value={editing.label_ru}
                          onChange={(e) => setEditing({ ...editing, label_ru: e.target.value })}
                        />
                      </td>
                      <td />
                      <td className="ds-text-right">
                        <div className="ds-flex ds-gap-1 ds-justify-end">
                          <button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="ds-btn ds-btn--sm ds-btn--ghost"
                            title="Guardar"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => { setEditing(null); setError('') }}
                            className="ds-btn ds-btn--sm ds-btn--ghost"
                            title="Cancelar"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    /* ─── Display row ─── */
                    <>
                      <td className="ds-text-sm ds-text-tertiary">{index + 1}</td>
                      <td className="ds-text-sm">
                        <code className="ds-text-xs">{def.key}</code>
                      </td>
                      <td className="ds-text-sm">{def.label_es}</td>
                      <td className="ds-text-sm ds-text-secondary">{def.label_en || '—'}</td>
                      <td className="ds-text-sm ds-text-secondary">{def.label_ru || '—'}</td>
                      <td>
                        <button
                          onClick={() => handleToggleActive(def)}
                          className={cn(
                            'ds-badge',
                            def.active ? 'ds-badge--success' : 'ds-badge--secondary'
                          )}
                          style={{ cursor: 'pointer' }}
                        >
                          {def.active ? 'Sí' : 'No'}
                        </button>
                      </td>
                      <td className="ds-text-right">
                        <div className="ds-flex ds-gap-1 ds-justify-end">
                          <button
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                            className="ds-btn ds-btn--sm ds-btn--ghost"
                            title="Subir"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === definitions.length - 1}
                            className="ds-btn ds-btn--sm ds-btn--ghost"
                            title="Bajar"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditing({
                                id: def.id,
                                key: def.key,
                                label_es: def.label_es,
                                label_en: def.label_en,
                                label_ru: def.label_ru,
                              })
                              setAdding(false)
                              setError('')
                            }}
                            className="ds-btn ds-btn--sm ds-btn--ghost"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(def)}
                            className="ds-btn ds-btn--sm ds-btn--ghost ds-text-error"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* ─── Add new row ─── */}
              {adding && (
                <tr>
                  <td className="ds-text-sm ds-text-tertiary">+</td>
                  <td>
                    <input
                      className="ds-input ds-input--sm"
                      placeholder="clave"
                      value={newDef.key}
                      onChange={(e) => setNewDef({ ...newDef, key: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="ds-input ds-input--sm"
                      placeholder="Etiqueta ES"
                      value={newDef.label_es}
                      onChange={(e) => setNewDef({ ...newDef, label_es: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="ds-input ds-input--sm"
                      placeholder="Label EN"
                      value={newDef.label_en}
                      onChange={(e) => setNewDef({ ...newDef, label_en: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      className="ds-input ds-input--sm"
                      placeholder="Метка RU"
                      value={newDef.label_ru}
                      onChange={(e) => setNewDef({ ...newDef, label_ru: e.target.value })}
                    />
                  </td>
                  <td />
                  <td className="ds-text-right">
                    <div className="ds-flex ds-gap-1 ds-justify-end">
                      <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="ds-btn ds-btn--sm ds-btn--ghost"
                        title="Guardar"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => { setAdding(false); setNewDef(EMPTY_EDIT); setError('') }}
                        className="ds-btn ds-btn--sm ds-btn--ghost"
                        title="Cancelar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {definitions.length === 0 && !adding && (
          <div className="ds-text-center ds-py-8">
            <p className="ds-text-secondary">No hay definiciones en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  )
}
