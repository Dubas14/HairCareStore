import React from 'react'
import { LoyaltyPageShell } from '../shared'
import LoyaltyTransactionsView from '@/components/payload/loyalty/LoyaltyTransactionsView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function LoyaltyTransactionsPage({ params, searchParams }: Args) {
  return (
    <LoyaltyPageShell params={params} searchParams={searchParams}>
      <LoyaltyTransactionsView />
    </LoyaltyPageShell>
  )
}
