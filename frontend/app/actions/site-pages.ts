'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { getSiteSettings } from '@/lib/payload/client'
import type { SiteSettingsData } from '@/lib/payload/client'

export async function getSitePageSettings(): Promise<{ settings: SiteSettingsData | null }> {
  const settings = await getSiteSettings()
  return { settings }
}

export async function updateSitePageSettings(
  data: Partial<SiteSettingsData>
): Promise<{ settings: SiteSettingsData; message: string }> {
  const payload = await getPayload({ config })
  const updated = await payload.updateGlobal({
    slug: 'site-settings',
    data: data as any,
  })
  return {
    settings: updated as unknown as SiteSettingsData,
    message: 'Налаштування збережено',
  }
}
