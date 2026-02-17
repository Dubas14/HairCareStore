import React from 'react'
import { LoyaltyPageShell } from './shared'
import LoyaltyDashboardView from '@/components/payload/loyalty/LoyaltyDashboardView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function LoyaltyPage({ params, searchParams }: Args) {
  return (
    <LoyaltyPageShell params={params} searchParams={searchParams}>
      <LoyaltyDashboardView />
    </LoyaltyPageShell>
  )
}
