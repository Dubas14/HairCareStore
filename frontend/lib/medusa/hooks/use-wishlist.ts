'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../client'
import { useAuthStore, Customer } from '@/stores/auth-store'

const MAX_WISHLIST_ITEMS = 50
const DEFAULT_REGION_ID = 'reg_01KGA7S8A0WMWH3W0Y8YWGVSJG' // Ukraine region

interface CustomerResponse {
  customer: Customer & {
    metadata?: {
      wishlist?: string[]
    }
  }
}

export function useWishlist() {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  // Fetch wishlist from custom API endpoint
  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: async (): Promise<string[]> => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist`,
          {
            credentials: 'include',
            headers: {
              'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
            },
          }
        )

        if (!response.ok) {
          if (response.status === 401) return []
          throw new Error('Failed to fetch wishlist')
        }

        const data = await response.json()
        return data.wishlist || []
      } catch (error) {
        return []
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  })

  const productIds = wishlistQuery.data || []

  // Fetch product details for wishlist items
  const productsQuery = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []

      try {
        const response = await sdk.store.product.list({
          id: productIds,
          limit: MAX_WISHLIST_ITEMS,
          region_id: DEFAULT_REGION_ID,
          fields: '+variants.calculated_price,+images.*',
        })
        return response.products || []
      } catch (error) {
        return []
      }
    },
    enabled: isAuthenticated && productIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })

  const isInWishlist = (productId: string): boolean => {
    return productIds.includes(productId)
  }

  return {
    productIds,
    items: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    isInWishlist,
    count: productIds.length,
  }
}

export function useAddToWishlist() {
  const { customer } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<Customer> => {
      if (!customer) throw new Error('Not authenticated')

      const currentWishlist = (customer.metadata?.wishlist as string[]) || []

      // Check if already in wishlist
      if (currentWishlist.includes(productId)) {
        return customer
      }

      // Check max limit
      if (currentWishlist.length >= MAX_WISHLIST_ITEMS) {
        throw new Error(`Максимум ${MAX_WISHLIST_ITEMS} товарів в списку бажань`)
      }

      // Use custom wishlist API endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({ product_id: productId }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to wishlist')
      }

      const data = await response.json()

      // Return updated customer with new wishlist
      return {
        ...customer,
        metadata: {
          ...customer.metadata,
          wishlist: data.wishlist,
        },
      }
    },
    onSuccess: () => {
      // Invalidate wishlist queries to refetch from API
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] })
    },
  })
}

export function useRemoveFromWishlist() {
  const { customer } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<Customer> => {
      if (!customer) throw new Error('Not authenticated')

      // Use custom wishlist API endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/wishlist/${productId}`,
        {
          method: 'DELETE',
          headers: {
            'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
          },
          credentials: 'include', // Important for cookies
        }
      )

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist')
      }

      const data = await response.json()

      // Return updated customer with new wishlist
      return {
        ...customer,
        metadata: {
          ...customer.metadata,
          wishlist: data.wishlist,
        },
      }
    },
    onSuccess: () => {
      // Invalidate wishlist queries to refetch from API
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] })
    },
  })
}

export function useToggleWishlist() {
  const { isInWishlist } = useWishlist()
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      if (isInWishlist(productId)) {
        await removeFromWishlist.mutateAsync(productId)
      } else {
        await addToWishlist.mutateAsync(productId)
      }
    },
  })
}
