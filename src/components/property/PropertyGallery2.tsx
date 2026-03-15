'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import type { PropertyImage } from '@/types/property'
import { cn } from '@/lib/utils'

interface PropertyGallery2Props {
  images: PropertyImage[]
  title: string
}

export function PropertyGallery2({ images, title }: PropertyGallery2Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goTo = useCallback(
    (dir: 1 | -1) => {
      setLightboxIndex((prev) => (prev + dir + images.length) % images.length)
    },
    [images.length],
  )

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goTo(-1)
      if (e.key === 'ArrowRight') goTo(1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxOpen, goTo])

  if (!images.length) return null

  const main = images[0]
  const sides = images.slice(1, 5)
  const totalPhotos = images.length

  return (
    <>
      {/* Mosaic grid: 1 large left + up to 4 small right */}
      <div className="vip-gallery2">
        <button
          type="button"
          className="vip-gallery2__main"
          onClick={() => openLightbox(0)}
          aria-label="Ampliar imagen"
        >
          <img
            src={main.url}
            alt={main.alt_text || title}
            className="vip-gallery2__img"
          />
        </button>

        {sides.length > 0 && (
          <div className="vip-gallery2__side">
            {sides.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={cn(
                  'vip-gallery2__side-item',
                  i === 0 && 'vip-gallery2__side-item--tr',
                  i === sides.length - 1 && 'vip-gallery2__side-item--br',
                )}
                onClick={() => openLightbox(i + 1)}
                aria-label={`Ver imagen ${i + 2}`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || `${title} ${i + 2}`}
                  className="vip-gallery2__img"
                />
                {/* Show "+N" overlay on last side image if more photos exist */}
                {i === sides.length - 1 && totalPhotos > 5 && (
                  <span className="vip-gallery2__more">
                    +{totalPhotos - 5}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Photo count badge */}
        <button
          type="button"
          className="vip-gallery2__count"
          onClick={() => openLightbox(0)}
          aria-label={`Ver las ${totalPhotos} fotos`}
        >
          <Camera size={14} />
          <span>{totalPhotos}</span>
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="vip-lightbox" onClick={closeLightbox}>
          <div className="vip-lightbox__content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="vip-lightbox__close"
              onClick={closeLightbox}
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <button
                type="button"
                className="vip-lightbox__nav vip-lightbox__nav--prev"
                onClick={() => goTo(-1)}
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].alt_text || `${title} ${lightboxIndex + 1}`}
              className="vip-lightbox__img"
            />

            {images.length > 1 && (
              <button
                type="button"
                className="vip-lightbox__nav vip-lightbox__nav--next"
                onClick={() => goTo(1)}
                aria-label="Siguiente imagen"
              >
                <ChevronRight size={28} />
              </button>
            )}

            <span className="vip-lightbox__counter">
              {lightboxIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
