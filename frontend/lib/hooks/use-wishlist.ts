'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/payload/wishlist-actions'
import { getProducts } from '@/lib/payload/actions'

export function useWishlist() {
  const { isAuthenticated, customer } = useAuthStore()

  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => customer ? getWishlist(customer.id) : [],
    enabled: isAuthenticated && !!customer,
    staleTime: 1000 * 60 * 5,
  })

  const productIds = wishlistQuery.data || []

  const productsQuery = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []
      const result = await getProducts({ limit: 50 })
      return result.products.filter(p => productIds.some(id => String(id) === String(p.id)))
    },
    enabled: isAuthenticated && productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  return {
    productIds,
    items: productsQuery.data || [],
    isLoading: wishlistQuery.isLoading || productsQuery.isLoading,
    isInWishlist: (productId: number | string) => productIds.some(id => String(id) === String(productId)),
    count: productIds.length,
  }
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  const { customer } = useAuthStore()
  return useMutation({
    mutationFn: async (productId: number | string) => {
      if (!customer) throw new Error('Not authenticated')
      return addToWishlist(customer.id, String(productId))
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }) },
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  const { customer } = useAuthStore()
  return useMutation({
    mutationFn: async (productId: number | string) => {
      if (!customer) throw new Error('Not authenticated')
      return removeFromWishlist(customer.id, String(productId))
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['wishlist'] }) },
  })
}

export function useToggleWishlist() {
  const { isInWishlist } = useWishlist()
  const add = useAddToWishlist()
  const remove = useRemoveFromWishlist()
  return useMutation({
    mutationFn: async (productId: number | string) => {
      if (isInWishlist(productId)) await remove.mutateAsync(productId)
      else await add.mutateAsync(productId)
    },
  })
}
