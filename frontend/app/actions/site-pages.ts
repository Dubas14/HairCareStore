'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getLocale } from 'next-intl/server'
import { getSiteSettings } from '@/lib/payload/client'
import type { SiteSettingsData } from '@/lib/payload/client'

export async function getSitePageSettings(): Promise<{ settings: SiteSettingsData | null }> {
  const locale = await getLocale()
  const settings = await getSiteSettings(locale)
  return { settings }
}

export async function updateSitePageSettings(
  data: Partial<SiteSettingsData>
): Promise<{ settings: SiteSettingsData; message: string }> {
  const payload = await getPayload({ config })
  const updated = await payload.updateGlobal({
    slug: 'site-settings',
    data: data as Record<string, unknown>,
  })
  return {
    settings: updated as unknown as SiteSettingsData,
    message: 'Налаштування збережено',
  }
}
