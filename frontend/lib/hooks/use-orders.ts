'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { getCustomerOrders, getOrderById } from '@/lib/payload/order-actions'
import type { PayloadOrder } from '@/lib/payload/types'

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
  const labels: Record<string, string> = { pending: 'Очікує обробки', completed: 'Виконано', canceled: 'Скасовано', requires_action: 'Потребує дії', archived: 'В архіві' }
  return labels[status] || status
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = { pending: 'bg-yellow-500/10 text-yellow-600', completed: 'bg-success/10 text-success', canceled: 'bg-muted text-muted-foreground', requires_action: 'bg-orange-500/10 text-orange-600', archived: 'bg-muted text-muted-foreground' }
  return colors[status] || 'bg-muted text-muted-foreground'
}
