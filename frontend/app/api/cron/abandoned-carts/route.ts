import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadCart } from '@/lib/payload/types'
import { createLogger } from '@/lib/logger'

const log = createLogger('cron:abandoned-carts')

const CRON_SECRET = process.env.CRON_SECRET

// Thresholds for sending abandoned cart emails (in hours)
const EMAIL_THRESHOLDS = [
  { hours: 1, emailNumber: 1 },   // 1st email after 1 hour
  { hours: 24, emailNumber: 2 },  // 2nd email after 24 hours
  { hours: 72, emailNumber: 3 },  // 3rd email after 72 hours
]

export async function GET(request: NextRequest) {
  // Verify auth
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const now = new Date()
    let totalSent = 0

    for (const threshold of EMAIL_THRESHOLDS) {
      const cutoff = new Date(now.getTime() - threshold.hours * 60 * 60 * 1000)

      // Find active carts that:
      // 1. Were last updated before the cutoff time
      // 2. Have items
      // 3. Have an email
      // 4. Haven't been sent this email yet (abandonedEmailsSent < emailNumber)
      const result = await payload.find({
        collection: 'carts',
        where: {
          and: [
            { status: { equals: 'active' } },
            { updatedAt: { less_than: cutoff.toISOString() } },
            { email: { exists: true } },
            { abandonedEmailsSent: { less_than: threshold.emailNumber } },
          ],
        },
        limit: 50,
        depth: 1,
      })

      for (const cart of result.docs) {
        const typedCart = cart as unknown as PayloadCart
        const items = typedCart.items || []
        if (items.length === 0) continue

        try {
          const { sendAbandonedCartEmail } = await import('@/lib/email/email-actions')
          const shippingAddr = typedCart.shippingAddress

          await sendAbandonedCartEmail({
            email: typedCart.email || '',
            customerName: shippingAddr?.firstName || '',
            items,
            total: typedCart.total || 0,
            currency: typedCart.currency || 'UAH',
            promoCode: typedCart.promoCode || undefined,
            promoDiscount: typedCart.promoDiscount || undefined,
          })

          // Update counter
          await payload.update({
            collection: 'carts',
            id: cart.id,
            data: { abandonedEmailsSent: threshold.emailNumber },
          })

          totalSent++
        } catch (err) {
          log.error(`Failed to send email for cart ${cart.id}`, err instanceof Error ? err : String(err))
        }
      }
    }

    // Expire old loyalty points (older than 12 months)
    let pointsExpired = 0
    try {
      const { expireOldPoints } = await import('@/lib/payload/loyalty-service')
      pointsExpired = await expireOldPoints()
      if (pointsExpired > 0) {
        log.info(`Expired ${pointsExpired} loyalty points`)
      }
    } catch (err) {
      log.error('Loyalty expiration failed', err instanceof Error ? err : String(err))
    }

    // Cleanup: delete abandoned/active carts older than 30 days
    let deletedCount = 0
    const cleanupCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    try {
      const staleCarts = await payload.find({
        collection: 'carts',
        where: {
          and: [
            { status: { in: ['active', 'abandoned'] } },
            { updatedAt: { less_than: cleanupCutoff.toISOString() } },
          ],
        },
        limit: 100,
        depth: 0,
      })
      for (const cart of staleCarts.docs) {
        await payload.delete({ collection: 'carts', id: cart.id })
        deletedCount++
      }
      if (deletedCount > 0) {
        log.info(`Cleaned up ${deletedCount} stale carts`)
      }
    } catch (err) {
      log.error('Cart cleanup failed', err instanceof Error ? err : String(err))
    }

    return NextResponse.json({
      success: true,
      emailsSent: totalSent,
      cartsDeleted: deletedCount,
      loyaltyPointsExpired: pointsExpired,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    log.error('Cron job error', error instanceof Error ? error : String(error))
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
