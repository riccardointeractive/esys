'use client'

import { AlertTriangle } from 'lucide-react'

interface DeletePropertyModalProps {
  propertyTitle: string
  isOpen: boolean
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeletePropertyModal({
  propertyTitle,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}: DeletePropertyModalProps) {
  if (!isOpen) return null

  return (
    <div className="ds-modal">
      <div className="ds-modal__content">
        <div className="ds-modal__header">
          <div className="ds-flex ds-items-center ds-gap-2">
            <AlertTriangle size={20} className="ds-text-error" />
            <h3>Eliminar propiedad</h3>
          </div>
        </div>
        <div className="ds-modal__body">
          <p className="ds-text-secondary">
            ¿Estás seguro de que deseas eliminar <strong>{propertyTitle}</strong>?
            Esta acción se puede revertir desde la base de datos.
          </p>
        </div>
        <div className="ds-modal__footer">
          <button
            type="button"
            onClick={onCancel}
            className="ds-btn ds-btn--secondary"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="ds-btn ds-btn--danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
