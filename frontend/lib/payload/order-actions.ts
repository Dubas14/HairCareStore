'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadOrder } from './types'

export async function getCustomerOrders(customerId: number | string, page: number = 1, limit: number = 10): Promise<{ orders: PayloadOrder[]; count: number; hasMore: boolean }> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({ collection: 'orders', where: { customer: { equals: customerId } }, sort: '-createdAt', limit, page, depth: 0 })
    return { orders: result.docs as unknown as PayloadOrder[], count: result.totalDocs, hasMore: result.hasNextPage }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { orders: [], count: 0, hasMore: false }
  }
}

export async function getOrderById(orderId: number | string): Promise<PayloadOrder | null> {
  try {
    const payload = await getPayload({ config })
    const order = await payload.findByID({ collection: 'orders', id: orderId, depth: 1 })
    return order as unknown as PayloadOrder
  } catch (error) {
    console.error('Error fetching order:', error)
    return null
  }
}
