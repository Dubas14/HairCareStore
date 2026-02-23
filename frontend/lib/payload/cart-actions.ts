'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadCart, PayloadProduct, CartItem, CartAddress } from './types'
import { applyAutoDiscounts } from './auto-discount-actions'
import { cartAddressUpdateSchema } from '@/lib/validations/schemas'
import { createLogger } from '@/lib/logger'

const log = createLogger('cart-actions')

const CART_COOKIE = 'hair-lab-cart-id'

async function getCartIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(CART_COOKIE)?.value || null
}

async function setCartCookie(cartId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(CART_COOKIE, String(cartId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

async function clearCartCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CART_COOKIE)
}

export async function getOrCreateCart(): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cartId = await getCartIdFromCookie()
  if (cartId) {
    try {
      const cart = await payload.findByID({ collection: 'carts', id: cartId, depth: 1 })
      const typedCart = cart as unknown as PayloadCart
      if (typedCart && typedCart.status === 'active') return typedCart
    } catch { /* cart not found */ }
  }
  const newCart = await payload.create({
    collection: 'carts',
    data: { status: 'active', items: [], subtotal: 0, total: 0, shippingTotal: 0, discountTotal: 0, loyaltyPointsUsed: 0, loyaltyDiscount: 0 },
  })
  await setCartCookie(String(newCart.id))
  return newCart as unknown as PayloadCart
}

export async function getCart(): Promise<PayloadCart | null> {
  const cartId = await getCartIdFromCookie()
  if (!cartId) return null
  try {
    const payload = await getPayload({ config })
    const cart = await payload.findByID({ collection: 'carts', id: cartId, depth: 1 })
    const typedCart = cart as unknown as PayloadCart
    if (typedCart && typedCart.status === 'active') return typedCart
    return null
  } catch { return null }
}

export async function addToCart(productId: number | string, variantIndex: number, quantity: number = 1): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const product = await payload.findByID({ collection: 'products', id: productId, depth: 1 })
  if (!product) throw new Error('Product not found')
  const typedProduct = product as unknown as PayloadProduct
  const variant = typedProduct.variants?.[variantIndex]
  if (!variant) throw new Error('Variant not found')
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Invalid quantity')

  const items: CartItem[] = [...(cart.items || [])]
  const existingIndex = items.findIndex(
    (item) => (typeof item.product === 'object' ? (item.product as PayloadProduct).id : item.product) === Number(productId) && item.variantIndex === variantIndex
  )

  if (existingIndex >= 0) {
    items[existingIndex] = { ...items[existingIndex], quantity: items[existingIndex].quantity + quantity }
  } else {
    const thumbnail = typedProduct.thumbnail
    const thumbnailUrl = thumbnail && typeof thumbnail === 'object' ? thumbnail.url || '' : ''
    items.push({ product: productId, variantIndex, variantTitle: variant.title, quantity, unitPrice: variant.price, productTitle: typedProduct.title, productThumbnail: thumbnailUrl })
  }

  const updated = await payload.update({ collection: 'carts', id: cart.id, data: { items }, depth: 1 })

  // Re-evaluate auto discounts
  await applyAutoDiscounts(cart.id)
  const refreshed = await payload.findByID({ collection: 'carts', id: cart.id, depth: 1 })
  return refreshed as unknown as PayloadCart
}

export async function updateCartItem(itemIndex: number, quantity: number): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const items: CartItem[] = [...(cart.items || [])]
  if (quantity <= 0) items.splice(itemIndex, 1)
  else if (items[itemIndex]) items[itemIndex] = { ...items[itemIndex], quantity: Math.min(quantity, 10) }
  const updated = await payload.update({ collection: 'carts', id: cart.id, data: { items }, depth: 1 })

  // Re-evaluate auto discounts
  await applyAutoDiscounts(cart.id)
  const refreshed = await payload.findByID({ collection: 'carts', id: cart.id, depth: 1 })
  return refreshed as unknown as PayloadCart
}

export async function removeCartItem(itemIndex: number): Promise<PayloadCart> {
  return updateCartItem(itemIndex, 0)
}

export async function updateCartAddresses(data: { email?: string; shippingAddress?: CartAddress; billingAddress?: CartAddress }): Promise<PayloadCart> {
  // Server-side Zod validation
  const parsed = cartAddressUpdateSchema.safeParse(data)
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Невірні дані')
  }

  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const updateData: Record<string, unknown> = {}
  if (data.email) updateData.email = data.email
  if (data.shippingAddress) updateData.shippingAddress = data.shippingAddress
  if (data.billingAddress) updateData.billingAddress = data.billingAddress
  const updated = await payload.update({ collection: 'carts', id: cart.id, data: updateData, depth: 1 })
  return updated as unknown as PayloadCart
}

export async function setCartShippingMethod(methodId: string, price: number): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const updated = await payload.update({ collection: 'carts', id: cart.id, data: { shippingMethod: methodId, shippingTotal: price }, depth: 1 })
  return updated as unknown as PayloadCart
}

export async function getShippingOptions(): Promise<Array<{ methodId: string; name: string; price: number; freeAbove?: number }>> {
  try {
    const payload = await getPayload({ config })
    const shippingConfig = await payload.findGlobal({ slug: 'shipping-config' })
    const shippingData = shippingConfig as unknown as { methods?: Array<{ methodId: string; name: string; price: number; freeAbove?: number; isActive: boolean }> }
    const methods = shippingData.methods || []
    return methods.filter((m) => m.isActive)
  } catch {
    return [{ methodId: 'nova-poshta', name: 'Нова Пошта', price: 70, freeAbove: 1000 }]
  }
}

/**
 * Complete cart with COD payment (no online payment needed).
 */
export async function completeCart(): Promise<{ orderId: number | string; displayId: number }> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  if (cart.status === 'completed') throw new Error('Cart already completed')
  if (!cart.items || cart.items.length === 0) throw new Error('Cart is empty')

  // Re-validate prices from database
  let recalculatedSubtotal = 0
  const orderItems = await Promise.all(
    cart.items.map(async (item) => {
      const productId = typeof item.product === 'object' ? (item.product as PayloadProduct).id : item.product
      const product = await payload.findByID({ collection: 'products', id: productId, depth: 0 })
      if (!product) throw new Error(`Product ${productId} not found`)

      const typedProduct = product as unknown as PayloadProduct
      const variant = typedProduct.variants?.[item.variantIndex]
      if (!variant) throw new Error(`Variant ${item.variantIndex} not found for product ${productId}`)

      // Inventory check
      if (variant.inStock === false) {
        throw new Error(`"${product.title}" (${variant.title || 'стандартний'}) немає в наявності`)
      }
      const quantity = Math.max(1, Math.min(Math.round(item.quantity), 10))
      if (typeof variant.inventory === 'number' && variant.inventory > 0 && quantity > variant.inventory) {
        throw new Error(`"${product.title}" — доступно лише ${variant.inventory} шт.`)
      }
      const verifiedPrice = variant.price
      const itemSubtotal = verifiedPrice * quantity
      recalculatedSubtotal += itemSubtotal

      return {
        productId,
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
  const promoDiscount = cart.promoDiscount || 0
  const recalculatedTotal = Math.max(0, recalculatedSubtotal + shippingTotal - discountTotal - loyaltyDiscount - promoDiscount)

  const order = await payload.create({
    collection: 'orders',
    data: {
      customer: typeof cart.customer === 'object' && cart.customer ? (cart.customer as { id: number | string }).id : cart.customer,
      email: cart.email || '',
      status: 'pending',
      paymentStatus: 'awaiting',
      fulfillmentStatus: 'not_fulfilled',
      items: orderItems,
      shippingAddress: cart.shippingAddress || {},
      billingAddress: cart.billingAddress || cart.shippingAddress || {},
      paymentMethod: 'cod',
      shippingMethod: cart.shippingMethod || '',
      currency: cart.currency || 'UAH',
      subtotal: recalculatedSubtotal,
      shippingTotal,
      discountTotal,
      loyaltyPointsUsed: cart.loyaltyPointsUsed || 0,
      loyaltyDiscount,
      total: recalculatedTotal,
      promoCode: cart.promoCode || '',
      promoDiscount: cart.promoDiscount || 0,
      cartId: String(cart.id),
    },
  })

  await payload.update({ collection: 'carts', id: cart.id, data: { status: 'completed', completedAt: new Date().toISOString() } })
  await clearCartCookie()

  const typedOrder = order as unknown as { id: number | string; displayId: number }

  // Record promo usage (fire-and-forget)
  if (cart.promoCode) {
    import('@/lib/payload/promo-actions')
      .then(({ recordPromoUsage }) => recordPromoUsage(
        cart.promoCode!,
        cart.email || '',
        Number(typedOrder.id),
        cart.promoDiscount || 0,
        cart.currency || 'UAH',
        typeof cart.customer === 'object' && cart.customer ? (cart.customer as { id: number | string }).id : cart.customer,
      ))
      .catch(err => log.error('Promo usage recording failed', err))
  }

  // Send order confirmation email (fire-and-forget)
  const displayId = typedOrder.displayId
  try {
    const { sendOrderConfirmationEmail } = await import('@/lib/email/email-actions')
    const shippingAddr = cart.shippingAddress
    sendOrderConfirmationEmail({
      email: cart.email || '',
      customerName: shippingAddr?.firstName || '',
      orderNumber: displayId,
      items: cart.items,
      subtotal: recalculatedSubtotal,
      shipping: shippingTotal,
      discount: discountTotal + loyaltyDiscount,
      total: recalculatedTotal,
      currency: cart.currency || 'UAH',
      shippingCity: shippingAddr?.city,
      shippingWarehouse: shippingAddr?.address1,
      paymentMethod: 'Накладений платіж',
    }).catch((err) => log.error('Order confirmation email failed', err))
  } catch (err) {
    log.error('Email module import failed', err)
  }

  return { orderId: order.id, displayId }
}

/**
 * Set payment method on the cart.
 */
export async function setCartPaymentMethod(method: 'cod' | 'stripe'): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const updated = await payload.update({
    collection: 'carts',
    id: cart.id,
    data: { paymentMethod: method },
    depth: 1,
  })
  return updated as unknown as PayloadCart
}

/**
 * Set currency on the cart.
 */
export async function setCartCurrency(currency: string): Promise<PayloadCart> {
  const validCurrencies = ['UAH', 'EUR', 'PLN', 'USD']
  if (!validCurrencies.includes(currency)) throw new Error('Непідтримувана валюта')
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const updated = await payload.update({
    collection: 'carts',
    id: cart.id,
    data: { currency },
    depth: 1,
  })
  return updated as unknown as PayloadCart
}

/**
 * Clear the cart cookie (exposed for use after Stripe payment completes on frontend).
 */
export async function clearCartAfterPayment(): Promise<void> {
  await clearCartCookie()
}

export async function linkCartToCustomer(customerId: number | string): Promise<void> {
  const payload = await getPayload({ config })
  const cartId = await getCartIdFromCookie()
  if (!cartId) return

  try {
    const cart = await payload.findByID({ collection: 'carts', id: cartId })
    const typedCart = cart as unknown as PayloadCart
    if (typedCart && typedCart.status === 'active' && !typedCart.customer) {
      await payload.update({ collection: 'carts', id: cartId, data: { customer: customerId } })
    }
  } catch { /* cart not found */ }
}
