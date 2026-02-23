'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import type { Customer } from '@/stores/auth-store'
import { useCartStore } from '@/stores/cart-store'
import { useLoyaltyStore } from '@/stores/loyalty-store'
import { useCompareStore } from '@/stores/compare-store'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useEffect } from 'react'
import { updateCustomerProfile } from '@/lib/payload/customer-actions'
import {
  loginCustomer,
  registerCustomer,
  getCurrentCustomer,
  logoutCustomer,
} from '@/lib/payload/auth-actions'
import { linkCartToCustomer } from '@/lib/payload/cart-actions'

export function useCustomer() {
  const { customer, isAuthenticated, isLoading, setCustomer, setLoading } = useAuthStore()

  const query = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      try {
        const data = await getCurrentCustomer()
        return data as Customer | null
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  })

  useEffect(() => {
    if (query.isLoading) setLoading(true)
    else setCustomer(query.data ?? null)
  }, [query.data, query.isLoading, setCustomer, setLoading])

  return { customer, isAuthenticated, isLoading: isLoading || query.isLoading, refetch: query.refetch }
}

export function useLogin() {
  const queryClient = useQueryClient()
  const { setCustomer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return loginCustomer(data.email, data.password)
    },
    onSuccess: async (customer) => {
      setCustomer(customer as unknown as Customer | null)
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      // Link the active cart to this customer
      if (customer?.id) {
        try {
          await linkCartToCustomer(customer.id)
        } catch { /* ignore */ }
      }
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { setCustomer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      return registerCustomer(data)
    },
    onSuccess: async (customer) => {
      setCustomer(customer as unknown as Customer | null)
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      // Link the active cart to this customer
      if (customer?.id) {
        try {
          await linkCartToCustomer(customer.id)
        } catch { /* ignore */ }
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await logoutCustomer()
    },
    onSuccess: () => {
      logout()

      // Clear all user-specific stores to prevent data leaking to next user
      useCartStore.getState().clearCart()
      useLoyaltyStore.getState().reset()
      useCompareStore.getState().clearCompare()
      useRecentlyViewedStore.getState().clearHistory()

      queryClient.invalidateQueries({ queryKey: ['customer'] })
      queryClient.removeQueries({ queryKey: ['customer'] })
      queryClient.clear()
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  const { setCustomer, customer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
      if (!customer) throw new Error('Not authenticated')
      return updateCustomerProfile(customer.id, data)
    },
    onSuccess: (updated) => {
      setCustomer(updated as unknown as Customer | null)
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}
