'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function getWishlist(customerId: number | string): Promise<(number | string)[]> {
  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({ collection: 'customers', id: customerId, depth: 0 })
    return ((customer as any).wishlist || []) as (number | string)[]
  } catch { return [] }
}

export async function addToWishlist(customerId: number | string, productId: number | string): Promise<(number | string)[]> {
  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId, depth: 0 })
  const current = ((customer as any).wishlist || []) as (number | string)[]
  if (current.includes(productId)) return current
  const updated = [...current, productId]
  await payload.update({ collection: 'customers', id: customerId, data: { wishlist: updated } })
  return updated
}

export async function removeFromWishlist(customerId: number | string, productId: number | string): Promise<(number | string)[]> {
  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId, depth: 0 })
  const current = ((customer as any).wishlist || []) as (number | string)[]
  const updated = current.filter((id) => String(id) !== String(productId))
  await payload.update({ collection: 'customers', id: customerId, data: { wishlist: updated } })
  return updated
}
