import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getPayload } from 'payload'
import config from '@payload-config'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOKS_ENDPOINT_SECRET
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOKS_ENDPOINT_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = await getPayload({ config })

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(payload, paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(payload, paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(payload, charge)
        break
      }

      default:
        // Unhandled event type — acknowledge receipt
        break
    }
  } catch (err) {
    console.error(`Error handling webhook event ${event.type}:`, err)
    // Return 200 to prevent Stripe from retrying for application errors
    // The issue should be investigated via logs
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(payload: any, paymentIntent: Stripe.PaymentIntent) {
  const { cartId } = paymentIntent.metadata

  // Find order by stripePaymentIntentId
  const orders = await payload.find({
    collection: 'orders',
    where: { stripePaymentIntentId: { equals: paymentIntent.id } },
    limit: 1,
  })

  if (orders.docs.length > 0) {
    const order = orders.docs[0]
    if (order.paymentStatus !== 'paid') {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { paymentStatus: 'paid' },
      })
    }
  }

  // Also mark cart as completed if it isn't already
  if (cartId) {
    try {
      const cart = await payload.findByID({ collection: 'carts', id: cartId })
      if (cart && cart.status === 'active') {
        await payload.update({
          collection: 'carts',
          id: cartId,
          data: { status: 'completed', completedAt: new Date().toISOString() },
        })
      }
    } catch {
      // Cart may already be completed
    }
  }
}

async function handlePaymentFailed(payload: any, paymentIntent: Stripe.PaymentIntent) {
  const orders = await payload.find({
    collection: 'orders',
    where: { stripePaymentIntentId: { equals: paymentIntent.id } },
    limit: 1,
  })

  if (orders.docs.length > 0) {
    await payload.update({
      collection: 'orders',
      id: orders.docs[0].id,
      data: { status: 'requires_action' },
    })
  }
}

async function handleRefund(payload: any, charge: Stripe.Charge) {
  if (!charge.payment_intent) return
  const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent.id

  const orders = await payload.find({
    collection: 'orders',
    where: { stripePaymentIntentId: { equals: piId } },
    limit: 1,
  })

  if (orders.docs.length > 0) {
    await payload.update({
      collection: 'orders',
      id: orders.docs[0].id,
      data: { paymentStatus: 'refunded' },
    })
  }
}
