'use server'

import { getPayload } from 'payload'
import { headers } from 'next/headers'
import config from '@payload-config'
import { isNovaPoshtaConfigured, searchCities, getWarehouses } from '@/lib/shipping/nova-poshta'
import type { CityOption, WarehouseOption } from '@/lib/shipping/nova-poshta-types'

async function requireAdmin(): Promise<void> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie') || ''
  try {
    const { user } = await payload.auth({ headers: new Headers({ cookie: cookieHeader }) })
    if (!user || (user as unknown as { collection?: string }).collection !== 'users') {
      throw new Error('Unauthorized: admin access required')
    }
  } catch {
    throw new Error('Unauthorized: admin access required')
  }
}

export interface ShippingMethod {
  id?: string
  methodId: string
  carrier?: string
  name: string
  price: number
  currency?: string
  freeAbove?: number | null
  estimatedDays?: number | null
  isActive: boolean
}

export interface ShippingZone {
  id?: string
  name: string
  isActive: boolean
  countries: string[]
  methods: ShippingMethod[]
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
  zones?: ShippingZone[]
  /** @deprecated use zones instead */
  methods?: ShippingMethod[]
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
  await requireAdmin()
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
