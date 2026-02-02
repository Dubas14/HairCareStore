'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../client'
import { useAuthStore, Customer } from '@/stores/auth-store'

const MAX_WISHLIST_ITEMS = 50

interface CustomerResponse {
  customer: Customer & {
    metadata?: {
      wishlist?: string[]
    }
  }
}

export function useWishlist() {
  const { customer, isAuthenticated, setCustomer } = useAuthStore()
  const queryClient = useQueryClient()

  // Get wishlist product IDs from customer metadata
  const productIds: string[] = (customer?.metadata?.wishlist as string[]) || []

  // Fetch product details for wishlist items
  const productsQuery = useQuery({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []

      try {
        const response = await sdk.store.product.list({
          id: productIds,
          limit: MAX_WISHLIST_ITEMS,
        })
        return response.products || []
      } catch (error) {
        console.error('Failed to fetch wishlist products:', error)
        return []
      }
    },
    enabled: isAuthenticated && productIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
  const { customer, setCustomer } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      if (!customer) throw new Error('Not authenticated')

      const currentWishlist = (customer.metadata?.wishlist as string[]) || []

      // Check if already in wishlist
      if (currentWishlist.includes(productId)) return

      // Check max limit
      if (currentWishlist.length >= MAX_WISHLIST_ITEMS) {
        throw new Error(`Максимум ${MAX_WISHLIST_ITEMS} товарів в списку бажань`)
      }

      const newWishlist = [...currentWishlist, productId]

      // Update customer metadata
      const response = await sdk.store.customer.update({
        metadata: {
          ...customer.metadata,
          wishlist: newWishlist,
        },
      })

      return
    },
    onMutate: async (productId) => {
      // Optimistic update
      if (customer) {
        const currentWishlist = (customer.metadata?.wishlist as string[]) || []
        if (!currentWishlist.includes(productId)) {
          setCustomer({
            ...customer,
            metadata: {
              ...customer.metadata,
              wishlist: [...currentWishlist, productId],
            },
          })
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] })
    },
    onError: (error, productId) => {
      // Revert optimistic update on error
      if (customer) {
        const currentWishlist = (customer.metadata?.wishlist as string[]) || []
        setCustomer({
          ...customer,
          metadata: {
            ...customer.metadata,
            wishlist: currentWishlist.filter((id) => id !== productId),
          },
        })
      }
    },
  })
}

export function useRemoveFromWishlist() {
  const { customer, setCustomer } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string): Promise<void> => {
      if (!customer) throw new Error('Not authenticated')

      const currentWishlist = (customer.metadata?.wishlist as string[]) || []
      const newWishlist = currentWishlist.filter((id) => id !== productId)

      // Update customer metadata
      await sdk.store.customer.update({
        metadata: {
          ...customer.metadata,
          wishlist: newWishlist,
        },
      })
    },
    onMutate: async (productId) => {
      // Optimistic update
      if (customer) {
        const currentWishlist = (customer.metadata?.wishlist as string[]) || []
        setCustomer({
          ...customer,
          metadata: {
            ...customer.metadata,
            wishlist: currentWishlist.filter((id) => id !== productId),
          },
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      queryClient.invalidateQueries({ queryKey: ['wishlist-products'] })
    },
    onError: (error, productId) => {
      // Revert optimistic update on error
      if (customer) {
        const currentWishlist = (customer.metadata?.wishlist as string[]) || []
        if (!currentWishlist.includes(productId)) {
          setCustomer({
            ...customer,
            metadata: {
              ...customer.metadata,
              wishlist: [...currentWishlist, productId],
            },
          })
        }
      }
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
