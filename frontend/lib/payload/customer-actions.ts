'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadCustomer, CustomerAddress } from './types'

export async function getCustomerById(id: number | string): Promise<PayloadCustomer | null> {
  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({ collection: 'customers', id, depth: 0 })
    return customer as unknown as PayloadCustomer
  } catch { return null }
}

export async function updateCustomerProfile(id: number | string, data: { firstName?: string; lastName?: string; phone?: string }): Promise<PayloadCustomer> {
  const payload = await getPayload({ config })
  const updated = await payload.update({ collection: 'customers', id, data })
  return updated as unknown as PayloadCustomer
}

export async function addCustomerAddress(customerId: number | string, address: CustomerAddress): Promise<PayloadCustomer> {
  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId })
  const addresses = [...((customer as any).addresses || []), address]
  const updated = await payload.update({ collection: 'customers', id: customerId, data: { addresses } })
  return updated as unknown as PayloadCustomer
}

export async function updateCustomerAddress(customerId: number | string, addressIndex: number, address: Partial<CustomerAddress>): Promise<PayloadCustomer> {
  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId })
  const addresses = [...((customer as any).addresses || [])]
  if (addresses[addressIndex]) addresses[addressIndex] = { ...addresses[addressIndex], ...address }
  const updated = await payload.update({ collection: 'customers', id: customerId, data: { addresses } })
  return updated as unknown as PayloadCustomer
}

export async function deleteCustomerAddress(customerId: number | string, addressIndex: number): Promise<PayloadCustomer> {
  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId })
  const addresses = [...((customer as any).addresses || [])]
  addresses.splice(addressIndex, 1)
  const updated = await payload.update({ collection: 'customers', id: customerId, data: { addresses } })
  return updated as unknown as PayloadCustomer
}

export async function setDefaultAddress(customerId: number | string, addressIndex: number): Promise<PayloadCustomer> {
  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId })
  const addresses = ((customer as any).addresses || []).map((addr: any, i: number) => ({ ...addr, isDefaultShipping: i === addressIndex }))
  const updated = await payload.update({ collection: 'customers', id: customerId, data: { addresses } })
  return updated as unknown as PayloadCustomer
}
