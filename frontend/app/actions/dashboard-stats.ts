'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export interface DashboardStats {
  productsCount: number
  ordersCount: number
  customersCount: number
  reviewsCount: number
  revenue: number
  recentOrders: Array<{
    id: string
    displayId: number
    email: string
    total: number
    status: string
    paymentStatus: string
    createdAt: string
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const payload = await getPayload({ config })

  const [productsResult, ordersResult, customersResult, reviewsResult, recentOrdersResult] =
    await Promise.all([
      payload.count({ collection: 'products', where: { status: { equals: 'active' } } }),
      payload.count({ collection: 'orders' }),
      payload.count({ collection: 'customers' }),
      payload.count({ collection: 'reviews' }),
      payload.find({
        collection: 'orders',
        sort: '-createdAt',
        limit: 5,
      }),
    ])

  // Calculate revenue from all non-canceled orders
  let revenue = 0
  if (ordersResult.totalDocs > 0) {
    const allOrders = await payload.find({
      collection: 'orders',
      limit: 10000,
      where: { status: { not_equals: 'canceled' } },
    })
    revenue = allOrders.docs.reduce((sum, order: any) => sum + (order.total || 0), 0)
  }

  return {
    productsCount: productsResult.totalDocs,
    ordersCount: ordersResult.totalDocs,
    customersCount: customersResult.totalDocs,
    reviewsCount: reviewsResult.totalDocs,
    revenue,
    recentOrders: recentOrdersResult.docs.map((order: any) => ({
      id: String(order.id),
      displayId: order.displayId || 0,
      email: order.email || '',
      total: order.total || 0,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'awaiting',
      createdAt: order.createdAt,
    })),
  }
}
