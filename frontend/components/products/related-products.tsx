'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/constants/home-data'
import { cn } from '@/lib/utils'

interface RelatedProductsProps {
  products: Product[]
  title?: string
  className?: string
}

export function RelatedProducts({
  products,
  title,
  className,
}: RelatedProductsProps) {
  const t = useTranslations('product')
  const scrollRef = useRef<HTMLDivElement>(null)
  const heading = title ?? t('complementCare')

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return

    const scrollAmount = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (products.length === 0) return null

  return (
    <section className={cn("py-8", className)}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{heading}</h2>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="hidden sm:flex"
            aria-label="Прокрутити вліво"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="hidden sm:flex"
            aria-label="Прокрутити вправо"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide"
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-72 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
