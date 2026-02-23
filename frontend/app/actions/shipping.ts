'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export interface ShippingMethod {
  id?: string
  methodId: string
  name: string
  price: number
  freeAbove?: number | null
  isActive: boolean
}

export interface ShippingConfigData {
  methods: ShippingMethod[]
}

export async function getShippingConfig(): Promise<{ config: ShippingConfigData }> {
  const payload = await getPayload({ config })
  const result = await payload.findGlobal({ slug: 'shipping-config' })
  return { config: result as unknown as ShippingConfigData }
}

export async function updateShippingConfig(
  data: ShippingConfigData
): Promise<{ config: ShippingConfigData; message: string }> {
  const payload = await getPayload({ config })
  const updated = await payload.updateGlobal({
    slug: 'shipping-config',
    data: data as unknown as Record<string, unknown>,
  })
  return {
    config: updated as unknown as ShippingConfigData,
    message: 'Збережено',
  }
}
