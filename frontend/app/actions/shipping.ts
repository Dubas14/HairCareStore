'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { isNovaPoshtaConfigured, searchCities, getWarehouses } from '@/lib/shipping/nova-poshta'
import type { CityOption, WarehouseOption } from '@/lib/shipping/nova-poshta-types'

export interface ShippingMethod {
  id?: string
  methodId: string
  name: string
  price: number
  freeAbove?: number | null
  isActive: boolean
}

export interface NovaPoshtaSender {
  cityRef?: string
  cityName?: string
  warehouseRef?: string
  warehouseName?: string
  senderPhone?: string
}

export interface ShippingConfigData {
  novaPoshtaSender?: NovaPoshtaSender
  defaultParcelWeight?: number
  methods: ShippingMethod[]
}

export async function getShippingConfig(): Promise<{ config: ShippingConfigData; npConfigured: boolean }> {
  const payload = await getPayload({ config })
  const result = await payload.findGlobal({ slug: 'shipping-config' })
  const npConfigured = await isNovaPoshtaConfigured()
  return {
    config: result as unknown as ShippingConfigData,
    npConfigured,
  }
}

export async function updateShippingConfig(
  data: Partial<ShippingConfigData>
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

/** Search NP cities (used in admin panel) */
export async function adminSearchCities(query: string): Promise<CityOption[]> {
  return searchCities(query)
}

/** Get NP warehouses (used in admin panel) */
export async function adminGetWarehouses(cityRef: string, search?: string): Promise<WarehouseOption[]> {
  return getWarehouses(cityRef, search)
}
