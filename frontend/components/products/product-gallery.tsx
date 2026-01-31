'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })
  const imageRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || !isZoomed) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setZoomPosition({ x, y })
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  // If only one image, duplicate it for demo purposes
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg']

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-2 lg:pb-0">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all",
              activeIndex === index
                ? "border-primary"
                : "border-transparent hover:border-muted-foreground/30"
            )}
            aria-label={`Перейти до зображення ${index + 1}`}
            aria-current={activeIndex === index}
          >
            <img
              src={image}
              alt={`${productName} - зображення ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative flex-1">
        <div
          ref={imageRef}
          className={cn(
            "relative aspect-square rounded-card overflow-hidden bg-muted cursor-zoom-in",
            isZoomed && "cursor-zoom-out"
          )}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
        >
          <img
            src={displayImages[activeIndex]}
            alt={`${productName} - зображення ${activeIndex + 1}`}
            className={cn(
              "w-full h-full object-cover transition-transform duration-200",
              isZoomed && "scale-150"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />

          {/* Zoom indicator */}
          {!isZoomed && (
            <div className="absolute bottom-4 right-4 bg-white/90 rounded-full p-2 shadow-soft">
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Navigation arrows */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-soft hover:bg-white transition-colors"
              aria-label="Попереднє зображення"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-soft hover:bg-white transition-colors"
              aria-label="Наступне зображення"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  activeIndex === index
                    ? "bg-primary w-4"
                    : "bg-white/70 hover:bg-white"
                )}
                aria-label={`Перейти до зображення ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
