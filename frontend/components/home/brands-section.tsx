'use client'

import { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import { brands } from '@/lib/constants/home-data'

export function BrandsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  return (
    <section className="py-16 md:py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Бренди, яким ми довіряємо
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Офіційні партнери світових виробників
          </p>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex-[0_0_200px] md:flex-[0_0_250px]"
              >
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-[120px] flex items-center justify-center border-2 border-transparent group-hover:border-gold">
                  {/* Since we don't have actual logos, display brand name */}
                  <span className="text-lg md:text-xl font-bold text-dark/40 group-hover:text-dark transition-colors duration-300 text-center">
                    {brand.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(brands.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index * 3)}
              className="w-2 h-2 rounded-full bg-muted hover:bg-gold transition-all duration-250"
              aria-label={`Go to brands ${index * 3 + 1}-${index * 3 + 3}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
