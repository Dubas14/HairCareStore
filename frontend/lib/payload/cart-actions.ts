'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadCart, CartAddress } from './types'

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
      if (cart && (cart as any).status === 'active') return cart as unknown as PayloadCart
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
    if (cart && (cart as any).status === 'active') return cart as unknown as PayloadCart
    return null
  } catch { return null }
}

export async function addToCart(productId: number | string, variantIndex: number, quantity: number = 1): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const product = await payload.findByID({ collection: 'products', id: productId, depth: 1 })
  if (!product) throw new Error('Product not found')
  const variant = (product as any).variants?.[variantIndex]
  if (!variant) throw new Error('Variant not found')

  const items = [...(cart.items || [])] as any[]
  const existingIndex = items.findIndex(
    (item: any) => (typeof item.product === 'object' ? item.product.id : item.product) == productId && item.variantIndex === variantIndex
  )

  if (existingIndex >= 0) {
    items[existingIndex] = { ...items[existingIndex], quantity: items[existingIndex].quantity + quantity }
  } else {
    const thumbnailUrl = product.thumbnail && typeof product.thumbnail === 'object' ? (product.thumbnail as any).url || '' : ''
    items.push({ product: productId, variantIndex, variantTitle: variant.title, quantity, unitPrice: variant.price, productTitle: product.title, productThumbnail: thumbnailUrl })
  }

  const updated = await payload.update({ collection: 'carts', id: cart.id, data: { items }, depth: 1 })
  return updated as unknown as PayloadCart
}

export async function updateCartItem(itemIndex: number, quantity: number): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const items = [...(cart.items || [])] as any[]
  if (quantity <= 0) items.splice(itemIndex, 1)
  else if (items[itemIndex]) items[itemIndex] = { ...items[itemIndex], quantity: Math.min(quantity, 10) }
  const updated = await payload.update({ collection: 'carts', id: cart.id, data: { items }, depth: 1 })
  return updated as unknown as PayloadCart
}

export async function removeCartItem(itemIndex: number): Promise<PayloadCart> {
  return updateCartItem(itemIndex, 0)
}

export async function updateCartAddresses(data: { email?: string; shippingAddress?: CartAddress; billingAddress?: CartAddress }): Promise<PayloadCart> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  const updateData: Record<string, any> = {}
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
    const methods = (shippingConfig as any).methods || []
    return methods.filter((m: any) => m.isActive)
  } catch {
    return [{ methodId: 'nova-poshta', name: 'Нова Пошта', price: 70, freeAbove: 1000 }]
  }
}

export async function completeCart(): Promise<{ orderId: number | string; displayId: number }> {
  const payload = await getPayload({ config })
  const cart = await getOrCreateCart()
  if (!cart.items || cart.items.length === 0) throw new Error('Cart is empty')

  const orderItems = cart.items.map((item: any) => ({
    productId: typeof item.product === 'object' ? item.product.id : item.product,
    productTitle: item.productTitle || 'Product',
    variantTitle: item.variantTitle || '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
    thumbnail: item.productThumbnail || '',
  }))

  const order = await payload.create({
    collection: 'orders',
    data: {
      customer: typeof cart.customer === 'object' ? (cart.customer as any)?.id : cart.customer,
      email: cart.email || '',
      status: 'pending',
      paymentStatus: 'awaiting',
      fulfillmentStatus: 'not_fulfilled',
      items: orderItems,
      shippingAddress: cart.shippingAddress || {},
      billingAddress: cart.billingAddress || cart.shippingAddress || {},
      paymentMethod: 'cod',
      shippingMethod: cart.shippingMethod || '',
      subtotal: cart.subtotal,
      shippingTotal: cart.shippingTotal,
      discountTotal: cart.discountTotal,
      loyaltyPointsUsed: cart.loyaltyPointsUsed,
      loyaltyDiscount: cart.loyaltyDiscount,
      total: cart.total,
      cartId: String(cart.id),
    },
  })

  await payload.update({ collection: 'carts', id: cart.id, data: { status: 'completed', completedAt: new Date().toISOString() } })
  await clearCartCookie()
  return { orderId: order.id, displayId: (order as any).displayId }
}

export async function linkCartToCustomer(customerId: number | string): Promise<void> {
  const payload = await getPayload({ config })
  const cartId = await getCartIdFromCookie()
  if (!cartId) return

  try {
    const cart = await payload.findByID({ collection: 'carts', id: cartId })
    if (cart && (cart as any).status === 'active' && !(cart as any).customer) {
      await payload.update({ collection: 'carts', id: cartId, data: { customer: customerId } })
    }
  } catch { /* cart not found */ }
}
