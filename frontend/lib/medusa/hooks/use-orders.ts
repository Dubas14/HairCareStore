'use client'

import { useQuery } from '@tanstack/react-query'
import { sdk } from '../client'
import { useAuthStore } from '@/stores/auth-store'

export interface OrderItem {
  id: string
  title: string
  thumbnail: string | null
  quantity: number
  unit_price: number
  subtotal: number
  variant?: {
    id: string
    title: string
    product?: {
      id: string
      title: string
      handle: string
      thumbnail: string | null
    }
  }
}

export interface OrderAddress {
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  address_1: string | null
}

export interface Order {
  id: string
  display_id: number
  status: 'pending' | 'completed' | 'canceled' | 'requires_action' | 'archived'
  created_at: string
  updated_at: string
  email: string
  total: number
  subtotal: number
  shipping_total: number
  discount_total: number
  tax_total: number
  items: OrderItem[]
  shipping_address: OrderAddress | null
  billing_address: OrderAddress | null
  fulfillment_status?: string
  payment_status?: string
}

interface OrderListResponse {
  orders: Order[]
  count: number
  offset: number
  limit: number
}

interface OrderResponse {
  order: Order
}

const ORDERS_PER_PAGE = 10

export function useOrders(page = 1) {
  const { isAuthenticated } = useAuthStore()
  const offset = (page - 1) * ORDERS_PER_PAGE

  const query = useQuery({
    queryKey: ['orders', page],
    queryFn: async (): Promise<{ orders: Order[]; count: number; hasMore: boolean }> => {
      try {
        const response = await sdk.store.order.list({
          limit: ORDERS_PER_PAGE,
          offset,
          fields: '+items,+items.variant,+items.variant.product,+shipping_address',
        })

        const data = response as OrderListResponse
        return {
          orders: data.orders || [],
          count: data.count || 0,
          hasMore: (data.offset + data.orders.length) < data.count,
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        return { orders: [], count: 0, hasMore: false }
      }
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  return {
    orders: query.data?.orders || [],
    count: query.data?.count || 0,
    hasMore: query.data?.hasMore || false,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useOrder(orderId: string | null) {
  const { isAuthenticated } = useAuthStore()

  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order | null> => {
      if (!orderId) return null

      try {
        const response = await sdk.store.order.retrieve(orderId, {
          fields: '+items,+items.variant,+items.variant.product,+shipping_address,+billing_address',
        })

        return (response as OrderResponse).order
      } catch (error) {
        console.error('Failed to fetch order:', error)
        return null
      }
    },
    enabled: isAuthenticated && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  return {
    order: query.data || null,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

// Helper function to get order status label in Ukrainian
export function getOrderStatusLabel(status: Order['status']): string {
  const labels: Record<Order['status'], string> = {
    pending: 'Очікує обробки',
    completed: 'Виконано',
    canceled: 'Скасовано',
    requires_action: 'Потребує дії',
    archived: 'В архіві',
  }
  return labels[status] || status
}

// Helper function to get order status color
export function getOrderStatusColor(status: Order['status']): string {
  const colors: Record<Order['status'], string> = {
    pending: 'bg-yellow-500/10 text-yellow-600',
    completed: 'bg-success/10 text-success',
    canceled: 'bg-muted text-muted-foreground',
    requires_action: 'bg-orange-500/10 text-orange-600',
    archived: 'bg-muted text-muted-foreground',
  }
  return colors[status] || 'bg-muted text-muted-foreground'
}
