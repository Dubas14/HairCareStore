import React from 'react'
import { SitePagesShell } from '../shared'
import DeliveryPageView from '@/components/payload/site-pages/DeliveryPageView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function SitePagesDeliveryPage({ params, searchParams }: Args) {
  return (
    <SitePagesShell params={params} searchParams={searchParams}>
      <DeliveryPageView />
    </SitePagesShell>
  )
}
