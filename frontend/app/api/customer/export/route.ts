import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GDPR Data Export — returns all customer data as JSON
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

    // Fetch related orders
    const orders = await payload.find({
      collection: 'orders',
      where: { customer: { equals: customerId } },
      limit: 1000,
      depth: 0,
    })

    const exportData = {
      exportDate: new Date().toISOString(),
      customer: {
        id: customer.id,
        email: (customer as Record<string, unknown>).email,
        firstName: (customer as Record<string, unknown>).firstName,
        lastName: (customer as Record<string, unknown>).lastName,
        phone: (customer as Record<string, unknown>).phone,
        addresses: (customer as Record<string, unknown>).addresses,
        createdAt: (customer as Record<string, unknown>).createdAt,
      },
      orders: orders.docs.map((order) => ({
        id: order.id,
        displayId: (order as Record<string, unknown>).displayId,
        status: (order as Record<string, unknown>).status,
        total: (order as Record<string, unknown>).total,
        items: (order as Record<string, unknown>).items,
        createdAt: (order as Record<string, unknown>).createdAt,
      })),
    }

    return NextResponse.json(exportData)
  } catch {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
