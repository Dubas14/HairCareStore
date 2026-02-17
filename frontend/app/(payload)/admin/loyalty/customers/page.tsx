import React from 'react'
import { LoyaltyPageShell } from '../shared'
import LoyaltyCustomersView from '@/components/payload/loyalty/LoyaltyCustomersView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function LoyaltyCustomersPage({ params, searchParams }: Args) {
  return (
    <LoyaltyPageShell params={params} searchParams={searchParams}>
      <LoyaltyCustomersView />
    </LoyaltyPageShell>
  )
}
