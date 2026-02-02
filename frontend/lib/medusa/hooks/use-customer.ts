'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore, Customer } from '@/stores/auth-store'
import { sdk } from '../client'
import { useEffect } from 'react'

// Response types
interface CustomerResponse {
  customer: Customer
}

// Hooks
export function useCustomer() {
  const { setCustomer, setLoading, customer, isAuthenticated, isLoading } = useAuthStore()

  const query = useQuery({
    queryKey: ['customer'],
    queryFn: async (): Promise<Customer | null> => {
      try {
        const response = await sdk.store.customer.retrieve()
        return (response as CustomerResponse).customer
      } catch {
        // 401 is expected for unauthenticated users
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  })

  useEffect(() => {
    if (query.isLoading) {
      setLoading(true)
    } else {
      setCustomer(query.data ?? null)
    }
  }, [query.data, query.isLoading, setCustomer, setLoading])

  return {
    customer,
    isAuthenticated,
    isLoading: isLoading || query.isLoading,
    refetch: query.refetch,
  }
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { setCustomer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: {
      email: string
      password: string
      first_name: string
      last_name: string
    }): Promise<Customer> => {
      // Step 1: Register auth identity
      const token = await sdk.auth.register('customer', 'emailpass', {
        email: data.email,
        password: data.password,
      })

      // Token is returned - SDK handles session automatically
      if (!token) {
        throw new Error('Помилка реєстрації')
      }

      // Step 2: Create customer profile (now authenticated via token/cookie)
      const response = await sdk.store.customer.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
      })

      return (response as CustomerResponse).customer
    },
    onSuccess: (customer) => {
      // Directly set customer data instead of invalidating to avoid 401 race condition
      setCustomer(customer)
      queryClient.setQueryData(['customer'], customer)
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      email: string
      password: string
    }): Promise<void> => {
      await sdk.auth.login('customer', 'emailpass', {
        email: data.email,
        password: data.password,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await sdk.auth.logout()
    },
    onSuccess: () => {
      logout()
      queryClient.invalidateQueries({ queryKey: ['customer'] })
      queryClient.removeQueries({ queryKey: ['customer'] })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  const { setCustomer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: {
      first_name?: string
      last_name?: string
      phone?: string
    }): Promise<Customer> => {
      const response = await sdk.store.customer.update(data)
      return (response as CustomerResponse).customer
    },
    onSuccess: (customer) => {
      setCustomer(customer)
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}
