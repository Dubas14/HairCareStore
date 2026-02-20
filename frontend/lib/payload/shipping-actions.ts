'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export interface ShippingMethod {
  methodId: string
  name: string
  carrier?: string
  price: number
  currency: string
  freeAbove?: number
  estimatedDays?: string
}

export interface ShippingZone {
  name: string
  countries: string[]
  methods: ShippingMethod[]
}

/**
 * Get shipping methods for a specific country code.
 * Falls back to legacy methods list if no zones match.
 */
export async function getShippingMethodsByCountry(
  countryCode: string = 'UA'
): Promise<ShippingMethod[]> {
  try {
    const payload = await getPayload({ config })
    const shippingConfig = await payload.findGlobal({ slug: 'shipping-config' })
    const zones = (shippingConfig as any).zones || []

    // Find zones that include this country
    for (const zone of zones) {
      if (!zone.isActive) continue
      const countries: string[] = zone.countries || []
      if (countries.includes(countryCode)) {
        const methods = (zone.methods || [])
          .filter((m: any) => m.isActive)
          .map((m: any) => ({
            methodId: m.methodId,
            name: m.name,
            carrier: m.carrier,
            price: m.price,
            currency: m.currency || 'UAH',
            freeAbove: m.freeAbove,
            estimatedDays: m.estimatedDays,
          }))
        if (methods.length > 0) return methods
      }
    }

    // Fallback to legacy methods
    const legacyMethods = (shippingConfig as any).methods || []
    return legacyMethods
      .filter((m: any) => m.isActive)
      .map((m: any) => ({
        methodId: m.methodId,
        name: m.name,
        price: m.price,
        currency: 'UAH',
        freeAbove: m.freeAbove,
      }))
  } catch {
    return [{ methodId: 'nova-poshta', name: 'Нова Пошта', price: 70, currency: 'UAH', freeAbove: 1000 }]
  }
}

/**
 * Get all available shipping zones (for admin/display purposes).
 */
export async function getShippingZones(): Promise<ShippingZone[]> {
  try {
    const payload = await getPayload({ config })
    const shippingConfig = await payload.findGlobal({ slug: 'shipping-config' })
    const zones = (shippingConfig as any).zones || []

    return zones
      .filter((z: any) => z.isActive)
      .map((z: any) => ({
        name: z.name,
        countries: z.countries || [],
        methods: (z.methods || [])
          .filter((m: any) => m.isActive)
          .map((m: any) => ({
            methodId: m.methodId,
            name: m.name,
            carrier: m.carrier,
            price: m.price,
            currency: m.currency || 'UAH',
            freeAbove: m.freeAbove,
            estimatedDays: m.estimatedDays,
          })),
      }))
  } catch {
    return []
  }
}

/**
 * Track order by order number and email (public, no auth required).
 */
export async function trackOrder(orderNumber: number, email: string): Promise<{
  found: boolean
  order?: {
    displayId: number
    status: string
    fulfillmentStatus: string
    trackingNumber?: string
    shippingMethod?: string
    createdAt: string
    total: number
    currency: string
  }
}> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { displayId: { equals: orderNumber } },
          { email: { equals: email } },
        ],
      },
      limit: 1,
      depth: 0,
    })

    if (result.docs.length === 0) return { found: false }

    const order = result.docs[0] as any
    return {
      found: true,
      order: {
        displayId: order.displayId,
        status: order.status,
        fulfillmentStatus: order.fulfillmentStatus,
        trackingNumber: order.trackingNumber,
        shippingMethod: order.shippingMethod,
        createdAt: order.createdAt,
        total: order.total,
        currency: order.currency || 'UAH',
      },
    }
  } catch {
    return { found: false }
  }
}
