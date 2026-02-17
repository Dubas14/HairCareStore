import React from 'react'
import configPromise from '@payload-config'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { initI18n } from '@payloadcms/translations'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import { headers as getHeaders } from 'next/headers'
import {
  createLocalReq,
  executeAuthStrategies,
  getAccessResults,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from 'payload'
import { importMap } from '../importMap'
import ShippingConfigView from '@/components/payload/shipping/ShippingConfigView'

type Args = {
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

export default async function ShippingPage({ params, searchParams }: Args) {
  const headers = await getHeaders()
  const cookies = parseCookies(headers)
  const config = await configPromise

  const payload = await getPayload({ config, importMap })

  const languageCode = getRequestLanguage({ config, cookies, headers })
  const i18n = await initI18n({
    config: config.i18n,
    context: 'client',
    language: languageCode,
  })

  const { user } = await executeAuthStrategies({ headers, payload })

  const req = await createLocalReq(
    {
      req: {
        headers,
        host: headers.get('host') ?? undefined,
        i18n: i18n as any,
        user,
      },
    },
    payload,
  )

  const permissions = await getAccessResults({ req })
  const visibleEntities = getVisibleEntities({ req })

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={undefined}
      params={await params}
      payload={req.payload}
      permissions={permissions}
      req={req}
      searchParams={await searchParams}
      user={req.user ?? undefined}
      visibleEntities={{
        collections: visibleEntities?.collections,
        globals: visibleEntities?.globals,
      }}
    >
      <ShippingConfigView />
    </DefaultTemplate>
  )
}
