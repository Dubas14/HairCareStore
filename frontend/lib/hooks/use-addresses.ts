'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { addCustomerAddress, updateCustomerAddress, deleteCustomerAddress, setDefaultAddress } from '@/lib/payload/customer-actions'
import type { CustomerAddress, PayloadCustomer } from '@/lib/payload/types'

export type { CustomerAddress }

export type Address = CustomerAddress & { id?: string }
export type AddressInput = CustomerAddress

export function useAddresses() {
  const { customer, isAuthenticated } = useAuthStore()
  const addresses = (customer as any)?.addresses || []
  const defaultAddress = addresses.find((a: any) => a.isDefaultShipping) || addresses[0] || null
  return { addresses, defaultAddress, isLoading: false, refetch: () => {} }
}

export function useAddAddress() {
  const queryClient = useQueryClient()
  const { customer, setCustomer } = useAuthStore()
  return useMutation({
    mutationFn: async (data: AddressInput) => {
      if (!customer) throw new Error('Not authenticated')
      return addCustomerAddress(customer.id, data)
    },
    onSuccess: (updated) => { setCustomer(updated as any); queryClient.invalidateQueries({ queryKey: ['customer'] }) },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()
  const { customer, setCustomer } = useAuthStore()
  return useMutation({
    mutationFn: async ({ index, data }: { index: number; data: Partial<AddressInput> }) => {
      if (!customer) throw new Error('Not authenticated')
      return updateCustomerAddress(customer.id, index, data)
    },
    onSuccess: (updated) => { setCustomer(updated as any); queryClient.invalidateQueries({ queryKey: ['customer'] }) },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()
  const { customer, setCustomer } = useAuthStore()
  return useMutation({
    mutationFn: async (index: number) => {
      if (!customer) throw new Error('Not authenticated')
      return deleteCustomerAddress(customer.id, index)
    },
    onSuccess: (updated) => { setCustomer(updated as any); queryClient.invalidateQueries({ queryKey: ['customer'] }) },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()
  const { customer, setCustomer } = useAuthStore()
  return useMutation({
    mutationFn: async (index: number) => {
      if (!customer) throw new Error('Not authenticated')
      return setDefaultAddress(customer.id, index)
    },
    onSuccess: (updated) => { setCustomer(updated as any); queryClient.invalidateQueries({ queryKey: ['customer'] }) },
  })
}
