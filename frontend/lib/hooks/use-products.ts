'use client'

import { useQuery } from '@tanstack/react-query'
import { getProducts, getProductByHandle, searchProducts, getProductsByCategory, getProductsByBrand } from '@/lib/payload/actions'
import type { PayloadProduct } from '@/lib/payload/types'
import { transformProducts } from '@/lib/payload/types'

export function useProducts(options: { limit?: number; offset?: number } = {}) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => getProducts(options),
  })
}

export function useProduct(handle: string) {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => getProductByHandle(handle),
    enabled: !!handle,
  })
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => searchProducts(query),
    enabled: query.length >= 2,
  })
}

export function useProductsByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: () => getProductsByCategory(categorySlug),
    enabled: !!categorySlug,
  })
}

export function useProductsByBrand(brandSlug: string) {
  return useQuery({
    queryKey: ['products', 'brand', brandSlug],
    queryFn: () => getProductsByBrand(brandSlug),
    enabled: !!brandSlug,
  })
}

export { transformProducts }
export type { PayloadProduct }
