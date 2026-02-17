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
import React from 'react'
import { importMap } from '../importMap'

interface LoyaltyPageShellProps {
  children: React.ReactNode
  params: Promise<Record<string, any>>
  searchParams: Promise<Record<string, string | string[]>>
}

/**
 * Server-side wrapper that renders children inside Payload's
 * real DefaultTemplate (sidebar, dark theme, toggle, scroll, logout).
 */
export async function LoyaltyPageShell({ children, params, searchParams }: LoyaltyPageShellProps) {
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
      {children}
    </DefaultTemplate>
  )
}
