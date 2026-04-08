'use client'

import { useState } from 'react'
import { Image } from 'lucide-react'
import { MediaUploader, SortableImageList } from '@digiko-npm/cms/media'
import type { SortableItem } from '@digiko-npm/cms/media'
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

const CAPTION_FIELDS = [
  { key: 'caption_es' as const, label: 'ES' },
  { key: 'caption_en' as const, label: 'EN' },
  { key: 'caption_ru' as const, label: 'RU' },
]

export function PropertyImageManager({ images, onChange }: PropertyImageManagerProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  const remaining = MEDIA_CONFIG.maxPropertyImages - images.length
  const atLimit = remaining <= 0

  function handleUpload(url: string) {
    if (atLimit) return
    onChange([
      ...images,
      { url, alt_text: '', caption_es: '', caption_en: '', caption_ru: '', sort_order: images.length },
    ])
  }

  function handlePickerSelect(urls: string[]) {
    const newImages: PropertyImageInput[] = urls.map((url, i) => ({
      url,
      alt_text: '',
      caption_es: '',
      caption_en: '',
      caption_ru: '',
      sort_order: images.length + i,
    }))
    onChange([...images, ...newImages])
  }

  function handleRemove(id: string) {
    const updated = images
      .filter((img) => img.url !== id)
      .map((img, i) => ({ ...img, sort_order: i }))
    onChange(updated)
  }

  function handleReorder(sortedItems: SortableItem[]) {
    const urlToImage = new Map(images.map((img) => [img.url, img]))
    const updated = sortedItems
      .map((item, i) => {
        const original = urlToImage.get(item.url)
        if (!original) return null
        return { ...original, sort_order: i }
      })
      .filter((img): img is PropertyImageInput => img !== null)
    onChange(updated)
  }

  function handleFieldChange(index: number, field: keyof PropertyImageInput, value: string) {
    const updated = images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    )
    onChange(updated)
  }

  const sortableItems: SortableItem[] = images.map((img) => ({
    id: img.url,
    url: img.url,
    label: img.caption_es || img.alt_text || undefined,
  }))

  return (
    <div>
      <div className="ds-flex ds-justify-between ds-items-center ds-mb-3">
        <span className="ds-text-sm ds-text-secondary">
          {images.length} / {MEDIA_CONFIG.maxPropertyImages}
        </span>
      </div>

      {/* Sortable image list */}
      {images.length > 0 && (
        <div className="ds-mb-4">
          <SortableImageList
            items={sortableItems}
            onReorder={handleReorder}
            onRemove={handleRemove}
            renderExtra={(_item, index) => (
              <div className="ds-flex ds-flex-col ds-gap-2">
                <input
                  type="text"
                  value={images[index]?.alt_text ?? ''}
                  onChange={(e) => handleFieldChange(index, 'alt_text', e.target.value)}
                  placeholder="Texto alternativo"
                  className="ds-input ds-input--sm ds-w-full"
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
                {CAPTION_FIELDS.map(({ key, label }) => (
                  <div key={key} className="ds-flex ds-items-center ds-gap-2">
                    <span className="ds-text-xs ds-text-tertiary">{label}</span>
                    <input
                      type="text"
                      value={images[index]?.[key] ?? ''}
                      onChange={(e) => handleFieldChange(index, key, e.target.value)}
                      placeholder="Descripción"
                      className="ds-input ds-input--sm ds-w-full"
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                    />
                  </div>
                ))}
              </div>
            )}
          />
        </div>
      )}

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
