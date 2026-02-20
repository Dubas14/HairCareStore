'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function getWishlist(customerId: number | string): Promise<string[]> {
  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({ collection: "customers", id: customerId, depth: 0 })
    const wishlist = (customer as any).wishlist || []
    return wishlist.map((item: any) => String(typeof item === "object" ? item.id : item))
  } catch {
    return []
  }
}

export async function addToWishlist(customerId: number | string, productId: string): Promise<string[]> {
  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({ collection: "customers", id: customerId, depth: 0 })
    const current: string[] = ((customer as any).wishlist || []).map((item: any) => String(typeof item === "object" ? item.id : item))
    if (current.includes(productId)) return current
    const updated = [...current, productId]
    await payload.update({ collection: "customers", id: customerId, data: { wishlist: updated.map(Number) } })
    return updated
  } catch {
    return []
  }
}

export async function removeFromWishlist(customerId: number | string, productId: string): Promise<string[]> {
  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({ collection: "customers", id: customerId, depth: 0 })
    const current: string[] = ((customer as any).wishlist || []).map((item: any) => String(typeof item === "object" ? item.id : item))
    const updated = current.filter((id) => id !== productId)
    await payload.update({ collection: "customers", id: customerId, data: { wishlist: updated.map(Number) } })
    return updated
  } catch {
    return []
  }
}

export async function syncWishlist(customerId: number | string, localItems: string[]): Promise<string[]> {
  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({ collection: "customers", id: customerId, depth: 0 })
    const serverItems: string[] = ((customer as any).wishlist || []).map((item: any) => String(typeof item === "object" ? item.id : item))
    const merged = [...new Set([...serverItems, ...localItems])]
    if (merged.length !== serverItems.length) {
      await payload.update({ collection: "customers", id: customerId, data: { wishlist: merged.map(Number) } })
    }
    return merged
  } catch {
    return localItems
  }
}
