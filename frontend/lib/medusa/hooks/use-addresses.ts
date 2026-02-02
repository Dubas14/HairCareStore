'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sdk } from '../client'
import { useAuthStore } from '@/stores/auth-store'

export interface Address {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  company: string | null
  address_1: string | null
  address_2: string | null
  city: string | null
  country_code: string | null
  province: string | null
  postal_code: string | null
  metadata: Record<string, unknown> | null
  is_default_shipping: boolean
  is_default_billing: boolean
}

export interface AddressInput {
  first_name: string
  last_name: string
  phone: string
  city: string
  address_1: string // Відділення НП
  country_code?: string
  metadata?: Record<string, unknown>
  is_default_shipping?: boolean
}

interface AddressListResponse {
  addresses: Address[]
  count: number
  offset: number
  limit: number
}

export function useAddresses() {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['addresses'],
    queryFn: async (): Promise<Address[]> => {
      try {
        const response = await sdk.store.customer.listAddress()
        return (response as AddressListResponse).addresses || []
      } catch {
        return []
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const addresses = query.data || []
  const defaultAddress = addresses.find((a) => a.is_default_shipping) || addresses[0] || null

  return {
    addresses,
    defaultAddress,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useAddAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddressInput): Promise<Address> => {
      const response = await sdk.store.customer.createAddress({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        city: data.city,
        address_1: data.address_1,
        country_code: data.country_code || 'ua',
        is_default_shipping: data.is_default_shipping || false,
        metadata: data.metadata,
      })

      // Response contains customer with addresses
      const customer = (response as { customer: { addresses: Address[] } }).customer
      const newAddress = customer.addresses[customer.addresses.length - 1]
      return newAddress
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}

export function useUpdateAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: Partial<AddressInput>
    }): Promise<void> => {
      await sdk.store.customer.updateAddress(id, {
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        city: data.city,
        address_1: data.address_1,
        is_default_shipping: data.is_default_shipping,
        metadata: data.metadata,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (addressId: string): Promise<void> => {
      await sdk.store.customer.deleteAddress(addressId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (addressId: string): Promise<void> => {
      await sdk.store.customer.updateAddress(addressId, {
        is_default_shipping: true,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      queryClient.invalidateQueries({ queryKey: ['customer'] })
    },
  })
}
