'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { stripe, toStripeAmount, SUPPORTED_CURRENCIES, type CurrencyCode } from '@/lib/stripe'
import type { PayloadCart } from './types'

/**
 * Create a Stripe PaymentIntent for the current cart.
 * Returns the clientSecret needed by Stripe Elements on the frontend.
 */
export async function createPaymentIntent(cartId: number | string): Promise<{
  clientSecret: string
  paymentIntentId: string
}> {
  const payload = await getPayload({ config })
  const cart = await payload.findByID({ collection: 'carts', id: cartId, depth: 1 })
  if (!cart) throw new Error('Кошик не знайдено')
  if ((cart as any).status !== 'active') throw new Error('Кошик вже завершений')

  const items = (cart as any).items || []
  if (items.length === 0) throw new Error('Кошик порожній')

  const total = (cart as any).total || 0
  if (total <= 0) throw new Error('Сума замовлення має бути більше 0')

  const currency = ((cart as any).currency || 'UAH') as CurrencyCode
  const currencyInfo = SUPPORTED_CURRENCIES[currency]
  if (!currencyInfo) throw new Error(`Непідтримувана валюта: ${currency}`)

  const stripeAmount = toStripeAmount(total, currency)

  // Check if cart already has a PaymentIntent — update it instead of creating new
  const existingPiId = (cart as any).stripePaymentIntentId
  if (existingPiId) {
    try {
      const existingPi = await stripe.paymentIntents.retrieve(existingPiId)
      if (existingPi.status === 'requires_payment_method' || existingPi.status === 'requires_confirmation') {
        // Update existing PaymentIntent with new amount
        const updatedPi = await stripe.paymentIntents.update(existingPiId, {
          amount: stripeAmount,
          currency: currencyInfo.stripeCode,
          metadata: {
            cartId: String(cartId),
            email: (cart as any).email || '',
          },
        })
        return {
          clientSecret: updatedPi.client_secret!,
          paymentIntentId: updatedPi.id,
        }
      }
    } catch {
      // PaymentIntent not found or in invalid state — create new one
    }
  }

  // Build line items description for Stripe
  const description = items
    .map((item: any) => `${item.productTitle || 'Product'} x${item.quantity}`)
    .join(', ')

  const paymentIntent = await stripe.paymentIntents.create({
    amount: stripeAmount,
    currency: currencyInfo.stripeCode,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      cartId: String(cartId),
      email: (cart as any).email || '',
    },
    description: description.substring(0, 1000),
    receipt_email: (cart as any).email || undefined,
  })

  // Save PaymentIntent ID and client secret on the cart
  await payload.update({
    collection: 'carts',
    id: cartId,
    data: {
      stripePaymentIntentId: paymentIntent.id,
      stripeClientSecret: paymentIntent.client_secret || '',
      paymentMethod: 'stripe',
    },
  })

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

/**
 * Complete cart after successful Stripe payment.
 * Called from frontend after Stripe confirms payment.
 */
export async function completeStripePayment(cartId: number | string, paymentIntentId: string): Promise<{
  orderId: number | string
  displayId: number
}> {
  const payload = await getPayload({ config })
  const cart = await payload.findByID({ collection: 'carts', id: cartId, depth: 1 }) as unknown as PayloadCart
  if (!cart) throw new Error('Кошик не знайдено')
  if (cart.status === 'completed') throw new Error('Замовлення вже оформлено')

  // Verify payment with Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (paymentIntent.status !== 'succeeded') {
    throw new Error(`Оплата не підтверджена. Статус: ${paymentIntent.status}`)
  }

  // Verify the payment amount matches cart total
  const currency = (cart.currency || 'UAH') as CurrencyCode
  const expectedAmount = toStripeAmount(cart.total, currency)
  if (paymentIntent.amount !== expectedAmount) {
    throw new Error('Сума оплати не відповідає сумі замовлення')
  }

  // Re-validate prices & inventory from DB
  let recalculatedSubtotal = 0
  const orderItems = await Promise.all(
    cart.items.map(async (item: any) => {
      const productId = typeof item.product === 'object' ? item.product.id : item.product
      const product = await payload.findByID({ collection: 'products', id: productId, depth: 0 })
      if (!product) throw new Error(`Товар ${productId} не знайдено`)

      const variant = (product as any).variants?.[item.variantIndex]
      if (!variant) throw new Error(`Варіант не знайдено`)

      if (variant.inStock === false) {
        throw new Error(`"${product.title}" немає в наявності`)
      }
      const quantity = Math.max(1, Math.min(Math.round(item.quantity), 10))
      if (typeof variant.inventory === 'number' && variant.inventory > 0 && quantity > variant.inventory) {
        throw new Error(`"${product.title}" — доступно лише ${variant.inventory} шт.`)
      }

      const verifiedPrice = variant.price
      const itemSubtotal = verifiedPrice * quantity
      recalculatedSubtotal += itemSubtotal

      return {
        productId: typeof productId === 'string' ? undefined : productId,
        productTitle: product.title || 'Product',
        variantTitle: variant.title || '',
        quantity,
        unitPrice: verifiedPrice,
        subtotal: itemSubtotal,
        thumbnail: item.productThumbnail || '',
      }
    })
  )

  const shippingTotal = cart.shippingTotal || 0
  const discountTotal = cart.discountTotal || 0
  const loyaltyDiscount = cart.loyaltyDiscount || 0
  const recalculatedTotal = recalculatedSubtotal + shippingTotal - discountTotal - loyaltyDiscount

  const order = await payload.create({
    collection: 'orders',
    data: {
      customer: typeof cart.customer === 'object' ? (cart.customer as any)?.id : cart.customer,
      email: cart.email || '',
      status: 'pending',
      paymentStatus: 'paid',
      fulfillmentStatus: 'not_fulfilled',
      items: orderItems,
      shippingAddress: cart.shippingAddress || {},
      billingAddress: cart.billingAddress || cart.shippingAddress || {},
      paymentMethod: 'stripe',
      shippingMethod: cart.shippingMethod || '',
      currency: cart.currency || 'UAH',
      stripePaymentIntentId: paymentIntentId,
      subtotal: recalculatedSubtotal,
      shippingTotal,
      discountTotal,
      loyaltyPointsUsed: cart.loyaltyPointsUsed || 0,
      loyaltyDiscount,
      total: recalculatedTotal,
      promoCode: (cart as any).promoCode || '',
      promoDiscount: (cart as any).promoDiscount || 0,
      cartId: String(cart.id),
    },
  })

  // Record promo usage (fire-and-forget)
  if ((cart as any).promoCode) {
    import('@/lib/payload/promo-actions')
      .then(({ recordPromoUsage }) => recordPromoUsage(
        (cart as any).promoCode,
        cart.email || '',
        (order as any).id,
        (cart as any).promoDiscount || 0,
        cart.currency || 'UAH',
        typeof cart.customer === 'object' ? (cart.customer as any)?.id : cart.customer,
      ))
      .catch(err => console.error('[Promo] Usage recording failed:', err))
  }

  // Mark cart as completed
  await payload.update({
    collection: 'carts',
    id: cart.id,
    data: { status: 'completed', completedAt: new Date().toISOString() },
  })

  // Send order confirmation email (fire-and-forget)
  const displayId = (order as any).displayId
  try {
    const { sendOrderConfirmationEmail } = await import('@/lib/email/email-actions')
    const shippingAddr = cart.shippingAddress
    sendOrderConfirmationEmail({
      email: cart.email || '',
      customerName: shippingAddr?.firstName || '',
      orderNumber: displayId,
      items: cart.items as any,
      subtotal: recalculatedSubtotal,
      shipping: shippingTotal,
      discount: discountTotal + loyaltyDiscount,
      total: recalculatedTotal,
      currency: cart.currency || 'UAH',
      shippingCity: shippingAddr?.city,
      shippingWarehouse: shippingAddr?.address1,
      paymentMethod: 'Онлайн оплата (Stripe)',
    }).catch((err) => console.error('[Email] Order confirmation failed:', err))
  } catch (err) {
    console.error('[Email] Import failed:', err)
  }

  return { orderId: order.id, displayId }
}
