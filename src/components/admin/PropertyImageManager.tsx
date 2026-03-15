'use client'

import { useState } from 'react'
import { X, GripVertical, Image } from 'lucide-react'
import { MediaUploader } from '@digiko-npm/cms/media'
import { ADMIN_API_ROUTES } from '@/config/routes'
import { MEDIA_CONFIG } from '@/config/media'
import { MediaPickerModal } from '@/components/admin/MediaPickerModal'
import type { PropertyImageInput } from '@/types/property'

interface PropertyImageManagerProps {
  images: PropertyImageInput[]
  onChange: (images: PropertyImageInput[]) => void
}

const uploadConfig = {
  uploadEndpoint: ADMIN_API_ROUTES.mediaPresign,
  mediaEndpoint: ADMIN_API_ROUTES.media,
}

export function PropertyImageManager({ images, onChange }: PropertyImageManagerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const remaining = MEDIA_CONFIG.maxPropertyImages - images.length
  const atLimit = remaining <= 0

  function handleUpload(url: string) {
    if (atLimit) return
    onChange([
      ...images,
      { url, alt_text: '', sort_order: images.length },
    ])
  }

  function handlePickerSelect(urls: string[]) {
    const newImages: PropertyImageInput[] = urls.map((url, i) => ({
      url,
      alt_text: '',
      sort_order: images.length + i,
    }))
    onChange([...images, ...newImages])
  }

  function handleRemove(index: number) {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sort_order: i }))
    onChange(updated)
  }

  function handleAltChange(index: number, alt_text: string) {
    const updated = images.map((img, i) =>
      i === index ? { ...img, alt_text } : img
    )
    onChange(updated)
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const updated = [...images]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    onChange(updated.map((img, i) => ({ ...img, sort_order: i })))
  }

  function handleMoveDown(index: number) {
    if (index === images.length - 1) return
    const updated = [...images]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    onChange(updated.map((img, i) => ({ ...img, sort_order: i })))
  }

  return (
    <div>
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-3">
        <span className="ds-text-sm ds-text-secondary">
          {images.length} / {MEDIA_CONFIG.maxPropertyImages}
        </span>
      </div>

      {/* Image list */}
      <div className="ds-flex ds-flex-col ds-gap-3 ds-mb-4">
        {images.map((img, index) => (
          <div
            key={`${img.url}-${index}`}
            className="ds-card ds-card--compact"
          >
          <div className="ds-card__body ds-flex ds-items-center ds-gap-3">
            <div className="ds-flex ds-flex-col ds-gap-1">
              <button
                type="button"
                onClick={() => handleMoveUp(index)}
                className="ds-btn ds-btn--ghost ds-btn--xs"
                disabled={index === 0}
                aria-label="Mover arriba"
              >
                <GripVertical size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(index)}
                className="ds-btn ds-btn--ghost ds-btn--xs"
                disabled={index === images.length - 1}
                aria-label="Mover abajo"
              >
                <GripVertical size={14} />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="vip-image-grid__item">
              <img
                src={img.url}
                alt={img.alt_text || `Imagen ${index + 1}`}
                className="ds-rounded-md"
                style={{ width: 80, height: 60, objectFit: 'cover' }}
              />
            </div>

            {/* Alt text */}
            <input
              type="text"
              value={img.alt_text}
              onChange={(e) => handleAltChange(index, e.target.value)}
              placeholder="Texto alternativo"
              className="ds-input ds-input--sm ds-flex-1"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
            />

            {/* Remove */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="ds-btn ds-btn--ghost ds-btn--sm ds-text-error"
              aria-label="Eliminar imagen"
            >
              <X size={16} />
            </button>
          </div>
          </div>
        ))}
      </div>

      {/* Actions: Upload + Pick from library */}
      {!atLimit && (
        <div className="ds-flex ds-flex-col ds-gap-3">
          <MediaUploader
            uploadConfig={uploadConfig}
            folder={MEDIA_CONFIG.paths.properties}
            accept={MEDIA_CONFIG.allowedImageTypes.join(',')}
            onUpload={handleUpload}
            label="Arrastra imágenes aquí o haz clic para subir"
            hint={`JPG, PNG, WebP, GIF · Max ${MEDIA_CONFIG.maxFileSizeMb} MB`}
            className=""
          />

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="ds-btn ds-btn--secondary ds-w-full"
          >
            <Image size={16} />
            <span className="ds-ml-2">Seleccionar de la biblioteca</span>
          </button>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handlePickerSelect}
        excludeUrls={images.map((i) => i.url)}
        maxSelectable={remaining}
      />
    </div>
  )
}
