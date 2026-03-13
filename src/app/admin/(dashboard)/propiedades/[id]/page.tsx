'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PropertyForm } from '@/components/admin/PropertyForm'
import { ADMIN_API_ROUTES } from '@/config/routes'
import type { PropertyWithRelations } from '@/types/property'

export default function AdminPropertyEditPage() {
  const { id } = useParams<{ id: string }>()
  const [property, setProperty] = useState<PropertyWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchProperty() {
      try {
        const res = await fetch(ADMIN_API_ROUTES.propertyById(id))
        if (!res.ok) {
          throw new Error('Propiedad no encontrada')
        }
        const data = await res.json()
        setProperty(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la propiedad')
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  if (loading) {
    return (
      <div className="ds-flex ds-justify-center ds-py-12">
        <span className="ds-text-secondary">Cargando propiedad...</span>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="ds-alert ds-alert--error">
        {error || 'Propiedad no encontrada'}
      </div>
    )
  }

  return <PropertyForm property={property} />
}
