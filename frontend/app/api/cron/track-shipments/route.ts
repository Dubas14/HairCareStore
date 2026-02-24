import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { trackShipment, isNovaPoshtaConfigured } from '@/lib/shipping/nova-poshta'
import { NP_DELIVERED_STATUSES } from '@/lib/shipping/nova-poshta-types'
import { createLogger } from '@/lib/logger'

const log = createLogger('cron:track-shipments')

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: NextRequest) {
  // Auth
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const configured = await isNovaPoshtaConfigured()
  if (!configured) {
    return NextResponse.json({ message: 'Nova Poshta API not configured', tracked: 0, updated: 0, errors: 0 })
  }

  const payload = await getPayload({ config })

  // Find orders that are shipped and have a tracking number
  const result = await payload.find({
    collection: 'orders',
    where: {
      and: [
        { fulfillmentStatus: { equals: 'shipped' } },
        { trackingNumber: { exists: true } },
      ],
    },
    limit: 100,
    depth: 0,
  })

  let tracked = 0
  let updated = 0
  let errors = 0

  for (const order of result.docs) {
    const ttn = (order as unknown as { trackingNumber: string }).trackingNumber
    if (!ttn) continue

    tracked++
    try {
      const tracking = await trackShipment(ttn)
      if (!tracking) continue

      // Check if delivered
      if (NP_DELIVERED_STATUSES.includes(tracking.statusCode)) {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: { fulfillmentStatus: 'delivered' } as Record<string, unknown>,
        })
        updated++
        log.info(`Order ${(order as unknown as { displayId: number }).displayId} marked as delivered (TTN: ${ttn})`)
      }
    } catch (err) {
      errors++
      log.error(`Failed to track TTN ${ttn}`, err)
    }
  }

  log.info(`Track shipments cron completed`, { tracked, updated, errors })

  return NextResponse.json({ tracked, updated, errors })
}
