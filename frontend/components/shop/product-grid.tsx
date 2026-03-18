'use client'

import { useEffect, useRef } from 'react'
import { ProductCard } from '@/components/products/product-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/lib/constants/home-data'
import { Search } from 'lucide-react'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_16px_44px_rgba(0,0,0,0.05)]">
      <Skeleton className="mb-4 aspect-square rounded-[1.5rem]" />
      <Skeleton className="mb-3 h-3 w-20 rounded-full" />
      <Skeleton className="mb-2 h-5 w-full rounded-full" />
      <Skeleton className="mb-4 h-5 w-2/3 rounded-full" />
      <div className="mb-4 flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-4 rounded-full" />
        ))}
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
      <Skeleton className="mb-4 h-7 w-28 rounded-full" />
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  )
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[2rem] border border-black/8 bg-white px-6 py-16 text-center shadow-[0_16px_44px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f4ebe2]">
            <Search className="h-7 w-7 text-[#2A9D8F]" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
          Товари не знайдено
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          Спробуйте змінити параметри пошуку або фільтрації, щоб знайти свій варіант догляду.
        </p>
      </div>
    )
  }

  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const cards = gridRef.current.querySelectorAll('[data-product-card]')
    if (cards.length === 0) return

    gsap.set(cards, { opacity: 0, y: 32, rotateX: -4 })

    const ctx = gsap.context(() => {
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.65,
        stagger: 0.06,
        ease: 'power3.out',
        clearProps: 'all',
      })
    }, gridRef)

    return () => ctx.revert()
  }, [products])

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} data-product-card>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}
