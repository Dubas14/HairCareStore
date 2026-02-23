'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { getCustomerOrders, getOrderById } from '@/lib/payload/order-actions'
import type { PayloadOrder } from '@/lib/payload/types'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_COLORS,
} from '@/lib/payload/types'

export type { PayloadOrder }

export function useOrders(page = 1) {
  const { isAuthenticated, customer } = useAuthStore()
  const query = useQuery({
    queryKey: ['orders', page],
    queryFn: async () => {
      if (!customer) return { orders: [], count: 0, hasMore: false }
      return getCustomerOrders(customer.id, page)
    },
    enabled: isAuthenticated && !!customer,
    staleTime: 1000 * 60 * 2,
  })
  return { orders: query.data?.orders || [], count: query.data?.count || 0, hasMore: query.data?.hasMore || false, isLoading: query.isLoading, refetch: query.refetch }
}

export function useOrder(orderId: string | null) {
  const { isAuthenticated } = useAuthStore()
  const query = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderId ? getOrderById(orderId) : null,
    enabled: isAuthenticated && !!orderId,
  })
  return { order: query.data || null, isLoading: query.isLoading, refetch: query.refetch }
}

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status
}

export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
}

export function getPaymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] || status
}

export function getPaymentStatusColor(status: string): string {
  return PAYMENT_STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
}

export function getFulfillmentStatusLabel(status: string): string {
  return FULFILLMENT_STATUS_LABELS[status] || status
}

export function getFulfillmentStatusColor(status: string): string {
  return FULFILLMENT_STATUS_COLORS[status] || 'bg-muted text-muted-foreground'
}
