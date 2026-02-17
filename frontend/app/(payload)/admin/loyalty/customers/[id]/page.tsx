import React from 'react'
import { LoyaltyPageShell } from '../../shared'
import LoyaltyCustomerDetailView from '@/components/payload/loyalty/LoyaltyCustomerDetailView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function LoyaltyCustomerDetailPage({ params, searchParams }: Args) {
  return (
    <LoyaltyPageShell params={params} searchParams={searchParams}>
      <LoyaltyCustomerDetailView />
    </LoyaltyPageShell>
  )
}
