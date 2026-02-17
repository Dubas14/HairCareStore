import React from 'react'
import { LoyaltyPageShell } from '../shared'
import LoyaltySettingsView from '@/components/payload/loyalty/LoyaltySettingsView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function LoyaltySettingsPage({ params, searchParams }: Args) {
  return (
    <LoyaltyPageShell params={params} searchParams={searchParams}>
      <LoyaltySettingsView />
    </LoyaltyPageShell>
  )
}
