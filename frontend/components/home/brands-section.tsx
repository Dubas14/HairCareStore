'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import type { Brand } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'

interface BrandsSectionProps {
  brands: Brand[]
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1
    },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  )

  if (brands.length === 0) return null

  return (
    <section className="section-spacing bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Бренди, яким ми довіряємо
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Офіційні партнери світових виробників
          </p>
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {brands.map((brand) => {
              const logoUrl = getImageUrl(brand.logo)

              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex-[0_0_200px] md:flex-[0_0_250px]"
                >
                  <div className="bg-card rounded-card p-6 md:p-8 shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-2 h-[120px] flex items-center justify-center border border-border group-hover:border-foreground/20">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={brand.name}
                        className="max-h-12 max-w-[160px] object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    ) : (
                      <span className="text-lg md:text-xl font-bold text-muted-foreground group-hover:text-foreground transition-colors duration-300 text-center">
                        {brand.name}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(brands.length / 3) }).map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index * 3)}
              className="w-2 h-2 rounded-full bg-muted-foreground/30 hover:bg-foreground transition-all duration-300 focus-ring"
              aria-label={`Go to brands ${index * 3 + 1}-${index * 3 + 3}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
