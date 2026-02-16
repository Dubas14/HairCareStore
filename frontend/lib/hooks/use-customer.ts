'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'
import { updateCustomerProfile } from '@/lib/payload/customer-actions'

export function useCustomer() {
  const { customer, isAuthenticated, isLoading, setCustomer, setLoading } = useAuthStore()

  const query = useQuery({
    queryKey: ['customer'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/customers/me', { credentials: 'include' })
        if (!res.ok) return null
        const data = await res.json()
        return data.user || null
      } catch { return null }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.errors?.[0]?.message || 'Невірний email або пароль')
      }
      return res.json()
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customer'] }) },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  const { setCustomer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { email: string; password: string; firstName: string; lastName: string }) => {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.errors?.[0]?.message || 'Помилка реєстрації')
      }
      const result = await res.json()
      // Auto-login after registration
      await fetch('/api/customers/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: data.email, password: data.password }),
      })
      return result.doc || result
    },
    onSuccess: (customer) => {
      setCustomer(customer)
      queryClient.setQueryData(['customer'], customer)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/customers/logout', { method: 'POST', credentials: 'include' })
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
  const { setCustomer, customer } = useAuthStore()

  return useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
      if (!customer) throw new Error('Not authenticated')
      return updateCustomerProfile(customer.id, data)
    },
    onSuccess: (updated) => {
      setCustomer(updated as any)
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}
