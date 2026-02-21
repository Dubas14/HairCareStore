import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

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
        const items = (cart as any).items || []
        if (items.length === 0) continue

        try {
          const { sendAbandonedCartEmail } = await import('@/lib/email/email-actions')
          const shippingAddr = (cart as any).shippingAddress

          await sendAbandonedCartEmail({
            email: (cart as any).email,
            customerName: shippingAddr?.firstName || '',
            items,
            total: (cart as any).total || 0,
            currency: (cart as any).currency || 'UAH',
            promoCode: (cart as any).promoCode || undefined,
            promoDiscount: (cart as any).promoDiscount || undefined,
          })

          // Update counter
          await payload.update({
            collection: 'carts',
            id: cart.id,
            data: { abandonedEmailsSent: threshold.emailNumber },
          })

          totalSent++
        } catch (err) {
          console.error(`[Abandoned Cart] Failed to send email for cart ${cart.id}:`, err)
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent: totalSent,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Abandoned Cart Cron] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
