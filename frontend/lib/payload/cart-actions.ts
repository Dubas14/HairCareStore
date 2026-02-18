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
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('Invalid quantity')

  const items = [...(cart.items || [])] as any[]
  const existingIndex = items.findIndex(
    (item: any) => (typeof item.product === 'object' ? item.product.id : item.product) === Number(productId) && item.variantIndex === variantIndex
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
  // Server-side validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    throw new Error('Невірний формат email')
  }
  if (data.shippingAddress) {
    const addr = data.shippingAddress
    if (addr.firstName && addr.firstName.length > 100) throw new Error('Занадто довге ім\'я')
    if (addr.lastName && addr.lastName.length > 100) throw new Error('Занадто довге прізвище')
    if (addr.phone && !/^[\d\s+()-]{7,20}$/.test(addr.phone)) throw new Error('Невірний формат телефону')
    if (addr.city && addr.city.length > 100) throw new Error('Занадто довга назва міста')
  }

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
  if ((cart as any).status === 'completed') throw new Error('Cart already completed')
  if (!cart.items || cart.items.length === 0) throw new Error('Cart is empty')

  // Re-validate prices from database
  let recalculatedSubtotal = 0
  const orderItems = await Promise.all(
    cart.items.map(async (item: any) => {
      const productId = typeof item.product === 'object' ? item.product.id : item.product
      const product = await payload.findByID({ collection: 'products', id: productId, depth: 0 })
      if (!product) throw new Error(`Product ${productId} not found`)

      const variant = (product as any).variants?.[item.variantIndex]
      if (!variant) throw new Error(`Variant ${item.variantIndex} not found for product ${productId}`)

      const quantity = Math.max(1, Math.min(Math.round(item.quantity), 10))
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
  const recalculatedTotal = recalculatedSubtotal + shippingTotal - discountTotal - loyaltyDiscount

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
      subtotal: recalculatedSubtotal,
      shippingTotal,
      discountTotal,
      loyaltyPointsUsed: cart.loyaltyPointsUsed || 0,
      loyaltyDiscount,
      total: recalculatedTotal,
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
