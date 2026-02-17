import React from 'react'
import { SitePagesShell } from './shared'
import AboutPageView from '@/components/payload/site-pages/AboutPageView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default function SitePagesAboutPage({ params, searchParams }: Args) {
  return (
    <SitePagesShell params={params} searchParams={searchParams}>
      <AboutPageView />
    </SitePagesShell>
  )
}
