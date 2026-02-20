'use client'

import { useQuery } from '@tanstack/react-query'
import { getProducts, getProductByHandle, searchProducts, getProductsByCategory, getProductsByBrand, getReviewsByProduct, getProductRating } from '@/lib/payload/actions'
import type { PayloadProduct } from '@/lib/payload/types'
import { transformProducts } from '@/lib/payload/types'

export interface UseProductsOptions {
  limit?: number
  offset?: number
  page?: number
  categoryId?: number | string
  categoryIds?: (string | number)[]
  brandId?: number | string
  brandIds?: (string | number)[]
  search?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

export function useProducts(options: UseProductsOptions = {}) {
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

export function useReviewsByProduct(productId: number | string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => getReviewsByProduct(productId),
    enabled: !!productId,
  })
}

export function useProductRating(productId: number | string) {
  return useQuery({
    queryKey: ['product-rating', productId],
    queryFn: () => getProductRating(productId),
    enabled: !!productId,
  })
}

export { transformProducts }
export type { PayloadProduct }
