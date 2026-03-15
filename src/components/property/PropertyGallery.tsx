'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import type { PropertyImage } from '@/types/property'
import { cn } from '@/lib/utils'

const MAX_VISIBLE_THUMBS = 8

interface PropertyGalleryProps {
  images: PropertyImage[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const mainImage = images[activeIndex] ?? images[0]
  if (!mainImage) return null

  const remaining = Math.max(0, images.length - MAX_VISIBLE_THUMBS)

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goTo = useCallback(
    (dir: 1 | -1) => {
      setActiveIndex((prev) => (prev + dir + images.length) % images.length)
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

  return (
    <>
      {/* Gallery grid */}
      <div className="vip-gallery">
        {/* Main image */}
        <button
          type="button"
          className="vip-gallery__main"
          onClick={() => openLightbox(activeIndex)}
          aria-label="Ampliar imagen"
        >
          <img
            src={mainImage.url}
            alt={mainImage.alt_text || title}
            className="vip-gallery__img"
          />
        </button>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="vip-gallery__thumbs">
            {images.slice(0, MAX_VISIBLE_THUMBS).map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={cn(
                  'vip-gallery__thumb',
                  i === activeIndex && 'vip-gallery__thumb--active',
                )}
                onClick={() => setActiveIndex(i)}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.alt_text || `${title} ${i + 1}`}
                  className="vip-gallery__img"
                />
              </button>
            ))}
            {remaining > 0 && (
              <button
                type="button"
                className="vip-gallery__thumb vip-gallery__thumb--more"
                onClick={() => openLightbox(MAX_VISIBLE_THUMBS)}
                aria-label={`Ver ${remaining} imágenes más`}
              >
                <Images size={18} />
                <span>+{remaining}</span>
              </button>
            )}
          </div>
        )}
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
              src={images[activeIndex].url}
              alt={images[activeIndex].alt_text || `${title} ${activeIndex + 1}`}
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
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
