'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export interface InventorySettingsData {
  lowStockThreshold: number
  outOfStockBehavior: 'hide' | 'show_unavailable'
  backInStockNotifications: boolean
}

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

export async function getInventorySettings(): Promise<{ settings: InventorySettingsData }> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'inventory-settings' })
  return { settings: settings as unknown as InventorySettingsData }
}

export async function updateInventorySettings(
  data: Partial<InventorySettingsData>,
): Promise<{ settings: InventorySettingsData; message: string }> {
  await requireAdmin()
  const payload = await getPayload({ config })
  const updated = await payload.updateGlobal({
    slug: 'inventory-settings',
    data: data as Record<string, unknown>,
  })
  return { settings: updated as unknown as InventorySettingsData, message: 'Збережено' }
}
