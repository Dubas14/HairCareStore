'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

async function requireAdmin(): Promise<void> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie') || ''
  try {
    const { user } = await payload.auth({ headers: new Headers({ cookie: cookieHeader }) })
    if (!user || (user as unknown as { collection?: string }).collection !== 'users') {
      throw new Error('Unauthorized: admin access required')
    }
  } catch {
    throw new Error('Unauthorized: admin access required')
  }
}

export interface EmailSettingsData {
  isActive: boolean
  emailTypes: {
    orderConfirmation: boolean
    welcome: boolean
    shippingNotification: boolean
    reviewRequest: boolean
    abandonedCart: boolean
    priceDrop: boolean
    backInStock: boolean
    loyaltyLevelUp: boolean
    newsletterConfirmation: boolean
  }
  abandonedCartConfig: {
    firstEmailHours: number
    secondEmailHours: number
    thirdEmailHours: number
  }
  stats: {
    totalSent: number
    lastSentAt: string | null
  }
}

export async function getEmailSettings(): Promise<{ settings: EmailSettingsData }> {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'email-settings' })
  return { settings: settings as unknown as EmailSettingsData }
}

export async function updateEmailSettings(
  data: Partial<Omit<EmailSettingsData, 'stats'>>
): Promise<{ settings: EmailSettingsData; message: string }> {
  await requireAdmin()
  const payload = await getPayload({ config })
  const updated = await payload.updateGlobal({
    slug: 'email-settings',
    data: data as Record<string, unknown>,
  })
  return { settings: updated as unknown as EmailSettingsData, message: 'Settings updated' }
}
