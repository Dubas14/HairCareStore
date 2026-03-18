'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [canHoverZoom, setCanHoverZoom] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => {
      const enabled = mediaQuery.matches && window.innerWidth >= 1024
      setCanHoverZoom(enabled)
      if (!enabled) {
        setIsZoomed(false)
      }
    }

    update()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update)
      return () => mediaQuery.removeEventListener('change', update)
    }

    mediaQuery.addListener(update)
    return () => mediaQuery.removeListener(update)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed || !canHoverZoom) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  const displayImages = images.length > 0 ? images : ['/placeholder.jpg']

  return (
    <div className="grid gap-4 lg:grid-cols-[110px_minmax(0,1fr)]">
      <div className="order-2 flex gap-2 overflow-x-auto pb-2 lg:order-1 lg:flex-col lg:overflow-y-auto lg:pb-0">
        {displayImages.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-[1.3rem] border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeIndex === index
                ? "border-[#1A1A1A] bg-white shadow-[0_12px_24px_rgba(0,0,0,0.06)]"
                : "border-black/8 bg-white hover:border-black/16"
            )}
            aria-label={`Перейти до зображення ${index + 1}`}
            aria-current={activeIndex === index}
          >
            <Image
              src={image}
              alt={`${productName} - зображення ${index + 1}`}
              width={88}
              height={88}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="order-1 lg:order-2">
        <div
          ref={imageRef}
          className={cn(
            "group relative aspect-[4/4.8] overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]",
            canHoverZoom && isZoomed && "cursor-zoom-out",
            canHoverZoom && !isZoomed && "cursor-zoom-in"
          )}
          onMouseEnter={() => {
            if (canHoverZoom) setIsZoomed(true)
          }}
          onMouseLeave={() => {
            if (canHoverZoom) setIsZoomed(false)
          }}
          onMouseMove={handleMouseMove}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(42,157,143,0.08),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#fbf7f2_100%)]" />
          <Image
            src={displayImages[activeIndex]}
            alt={`${productName} - зображення ${activeIndex + 1}`}
            width={900}
            height={1100}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority={activeIndex === 0}
            className={cn(
              "relative h-full w-full object-cover transition-transform duration-200",
              canHoverZoom && isZoomed && "scale-150"
            )}
            style={
              canHoverZoom && isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />

          {canHoverZoom && !isZoomed && (
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-black/8 bg-white px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground/56 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
              <ZoomIn className="h-4 w-4 text-[#2A9D8F]" />
              Збільшити
            </div>
          )}

          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-[52%]"
                aria-label="Попереднє зображення"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/8 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-[52%]"
                aria-label="Наступне зображення"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
