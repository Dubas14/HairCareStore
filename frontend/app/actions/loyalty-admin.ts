'use server'

import {
  getStats,
  getAllCustomers,
  getCustomerLoyaltySummary,
  getTransactionHistory,
  getAllTransactions,
  adjustPoints,
  getOrCreateLoyaltyRecord,
} from '@/lib/payload/loyalty-service'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import type {
  LoyaltyStats,
  LoyaltySettings,
  LoyaltyCustomer,
  LoyaltySummary,
  Transaction,
  CustomerData,
} from '@/components/payload/loyalty/types'
import type { LoyaltyRecord } from '@/lib/payload/types'

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

export async function getLoyaltyStats(): Promise<{ stats: LoyaltyStats }> {
  const stats = await getStats()
  return { stats: stats as unknown as LoyaltyStats }
}

export async function getLoyaltySettings(): Promise<{ settings: LoyaltySettings }> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'loyalty-settings' })
  return { settings: settings as unknown as LoyaltySettings }
}

export async function updateLoyaltySettings(data: Partial<LoyaltySettings>): Promise<{ settings: LoyaltySettings; message: string }> {
  await requireAdmin()
  const payload = await getPayload({ config })
  const updated = await payload.updateGlobal({ slug: 'loyalty-settings', data: data as Record<string, unknown> })
  return { settings: updated as unknown as LoyaltySettings, message: 'Settings updated' }
}

export async function getLoyaltyCustomers(params?: { search?: string; limit?: number; offset?: number }): Promise<{ customers: LoyaltyCustomer[]; count: number }> {
  await requireAdmin()
  const result = await getAllCustomers(params?.limit || 20, params?.offset || 0, params?.search)
  return { customers: result.customers as unknown as LoyaltyCustomer[], count: result.count }
}

export async function getLoyaltyCustomerDetail(id: string): Promise<{ loyalty: LoyaltySummary; transactions: Transaction[]; customer: CustomerData | null }> {
  await requireAdmin()
  const loyalty = await getCustomerLoyaltySummary(id)
  const txResult = await getTransactionHistory(id, 50)
  let customer: CustomerData | null = null
  try { const payload = await getPayload({ config }); const c = await payload.findByID({ collection: 'customers', id }); customer = c as unknown as CustomerData } catch {}
  return { loyalty: loyalty as unknown as LoyaltySummary, transactions: txResult.transactions as unknown as Transaction[], customer }
}

export async function toggleCustomerLoyalty(id: string, isEnabled: boolean): Promise<{ loyalty: LoyaltySummary; message: string }> {
  await requireAdmin()
  const payload = await getPayload({ config })
  const record = await getOrCreateLoyaltyRecord(id) as unknown as LoyaltyRecord
  await payload.update({ collection: 'loyalty-points', id: record.id, data: { isEnabled } })
  const updated = await getCustomerLoyaltySummary(id)
  return { loyalty: updated as unknown as LoyaltySummary, message: isEnabled ? 'Enabled' : 'Disabled' }
}

export async function adjustCustomerPoints(id: string, amount: number, description?: string): Promise<{ loyalty: LoyaltySummary; message: string }> {
  await requireAdmin()
  await adjustPoints(id, amount, description || 'Manual adjustment')
  const updated = await getCustomerLoyaltySummary(id)
  return { loyalty: updated as unknown as LoyaltySummary, message: 'Points adjusted' }
}

export async function getLoyaltyTransactions(params?: { limit?: number; offset?: number }): Promise<{ transactions: Transaction[]; count: number }> {
  await requireAdmin()
  const result = await getAllTransactions(params?.limit || 20, params?.offset || 0)
  return { transactions: result.transactions as unknown as Transaction[], count: result.count }
}
