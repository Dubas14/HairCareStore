import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import config from '@payload-config'

/**
 * Export orders as CSV
 * Admin-only endpoint (requires Payload user auth)
 * Query params: from, to (dates), status
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // Verify admin user via cookie auth
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const status = searchParams.get('status')

    // Build where clause
    const conditions: Where[] = []
    if (from) {
      conditions.push({ createdAt: { greater_than_equal: from } })
    }
    if (to) {
      conditions.push({ createdAt: { less_than_equal: to } })
    }
    if (status) {
      conditions.push({ status: { equals: status } })
    }
    const where: Where = conditions.length > 0 ? { and: conditions } : {}

    const orders = await payload.find({
      collection: 'orders',
      where: conditions.length > 0 ? where : undefined,
      limit: 10000,
      sort: '-createdAt',
      depth: 1,
    })

    // Build CSV
    const headers = [
      'Order ID',
      'Display ID',
      'Date',
      'Customer Email',
      'Status',
      'Payment Status',
      'Fulfillment',
      'Payment Method',
      'Subtotal',
      'Shipping',
      'Discount',
      'Total',
      'Currency',
      'Items Count',
      'Shipping City',
      'Tracking Number',
    ]

    const rows = orders.docs.map((order) => {
      const o = order as Record<string, unknown>
      const shipping = o.shippingAddress as Record<string, unknown> | undefined
      const items = o.items as Array<unknown> | undefined
      return [
        String(o.id),
        String(o.displayId || ''),
        o.createdAt ? new Date(o.createdAt as string).toISOString().split('T')[0] : '',
        String(o.email || ''),
        String(o.status || ''),
        String(o.paymentStatus || ''),
        String(o.fulfillmentStatus || ''),
        String(o.paymentMethod || ''),
        String(o.subtotal || 0),
        String(o.shippingTotal || 0),
        String(o.discountTotal || 0),
        String(o.total || 0),
        String(o.currency || 'UAH'),
        String(items?.length || 0),
        String(shipping?.city || ''),
        String(o.trackingNumber || ''),
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
