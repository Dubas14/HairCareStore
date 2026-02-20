import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GDPR Account Deletion — anonymizes customer data
 * Keeps order records (legal requirement) but removes personal info
 * Requires customerId + email for verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, email } = body

    if (!customerId || !email) {
      return NextResponse.json({ error: 'Missing customerId or email' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Verify customer exists and email matches
    const customer = await payload.findByID({
      collection: 'customers',
      id: customerId,
      depth: 0,
    })

    if (!customer || (customer as { email?: string }).email !== email) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Anonymize customer data (keep record for order history reference)
    await payload.update({
      collection: 'customers',
      id: customerId,
      data: {
        firstName: 'Видалений',
        lastName: 'Користувач',
        phone: '',
        addresses: [],
        wishlist: [],
      } as Record<string, unknown>,
    })

    // Anonymize shipping addresses in orders (keep order totals for accounting)
    const orders = await payload.find({
      collection: 'orders',
      where: { customer: { equals: customerId } },
      limit: 1000,
      depth: 0,
    })

    for (const order of orders.docs) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          shippingAddress: {
            firstName: 'Видалено',
            lastName: '',
            phone: '',
            city: '',
            address1: '',
          },
          billingAddress: {
            firstName: 'Видалено',
            lastName: '',
            phone: '',
            city: '',
            address1: '',
          },
        } as Record<string, unknown>,
      })
    }

    return NextResponse.json({ success: true, message: 'Account data deleted' })
  } catch {
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
