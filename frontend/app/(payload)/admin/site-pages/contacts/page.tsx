import React from 'react'
import { SitePagesShell } from '../shared'
import ContactsPageView from '@/components/payload/site-pages/ContactsPageView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function SitePagesContactsPage({ params, searchParams }: Args) {
  return (
    <SitePagesShell params={params} searchParams={searchParams}>
      <ContactsPageView />
    </SitePagesShell>
  )
}
