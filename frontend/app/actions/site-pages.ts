'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { SiteSettingsData } from '@/lib/payload/client'

export async function getSitePageSettings(): Promise<{ settings: SiteSettingsData | null }> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.findGlobal({ slug: 'site-settings' })
    return { settings: result as unknown as SiteSettingsData }
  } catch (err: any) {
    console.error('Error fetching site settings:', err)
    return { settings: null }
  }
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
