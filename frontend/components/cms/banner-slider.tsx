'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Banner, getImageUrl } from '@/lib/payload/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BannerSliderProps {
  banners: Banner[]
  autoPlay?: boolean
  interval?: number
}

export function BannerSlider({
  banners,
  autoPlay = true,
  interval = 5000
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, banners.length])

  if (banners.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  const currentBanner = banners[currentIndex]
  const imageUrl = getImageUrl(currentBanner.image)

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-neutral-900">
      {/* Banner Image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={currentBanner.title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 to-neutral-800" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
            {currentBanner.title}
          </h2>
          {currentBanner.link && (
            <Link
              href={currentBanner.link}
              className="inline-block bg-white text-black px-8 py-3 font-medium hover:bg-neutral-200 transition-colors"
            >
              Переглянути
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
            aria-label="Попередній"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
            aria-label="Наступний"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Банер ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
