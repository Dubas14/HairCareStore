'use client'

import { ProductCard } from '@/components/products/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import type { Product } from '@/lib/constants/home-data'
import { Search } from 'lucide-react'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-card p-4 shadow-soft">
      {/* Image skeleton */}
      <Skeleton className="aspect-square mb-4 rounded-card" />

      {/* Brand skeleton */}
      <Skeleton className="h-3 w-16 mb-2" />

      {/* Name skeleton */}
      <Skeleton className="h-5 w-full mb-1" />
      <Skeleton className="h-5 w-2/3 mb-3" />

      {/* Rating skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-4 w-8" />
      </div>

      {/* Price skeleton */}
      <Skeleton className="h-6 w-24 mb-4" />

      {/* Button skeleton */}
      <Skeleton className="h-10 w-full rounded-button" />
    </div>
  )
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <Search className="w-16 h-16 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Товари не знайдено</h3>
        <p className="text-muted-foreground">
          Спробуйте змінити параметри фільтрації або пошуку
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <ScrollReveal
          key={product.id}
          variant="fade-up"
          delay={Math.min(index * 50, 300)}
          duration={500}
          threshold={0.05}
        >
          <ProductCard product={product} />
        </ScrollReveal>
      ))}
    </div>
  )
}
