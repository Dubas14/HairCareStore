'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/products/product-card'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { Product } from '@/lib/constants/home-data'

interface PopularProductsProps {
  products: Product[]
  title?: string
  accentColor?: string
}

export function PopularProducts({
  products,
  title = 'Популярні товари',
  accentColor
}: PopularProductsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scrollAmount = 300
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <ScrollReveal variant="fade-up" duration={500}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {title}
            </h2>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                aria-label="Попередній"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="p-2 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                aria-label="Наступний"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Products Carousel */}
        <ScrollReveal variant="fade-up" delay={100} duration={600}>
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[260px] sm:w-[280px] snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
