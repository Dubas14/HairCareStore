'use server'

import { sendEmail } from './send'
import { OrderConfirmation } from './templates/order-confirmation'
import { Welcome } from './templates/welcome'
import { ShippingNotification } from './templates/shipping-notification'
import { AbandonedCart } from './templates/abandoned-cart'
import { EmailVerification } from './templates/email-verification'
import { getImageUrl } from '@/lib/payload/types'
import type { PayloadProduct, CartItem } from '@/lib/payload/types'

// ─── Order Confirmation Email ──────────────────────────────────

interface OrderEmailData {
  email: string
  customerName: string
  orderNumber: number
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  currency?: string
  shippingCity?: string
  shippingWarehouse?: string
  paymentMethod: string
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const items = data.items.map((item) => {
    const product = typeof item.product === 'object' ? (item.product as PayloadProduct) : null
    return {
      name: item.productTitle || product?.title || 'Товар',
      variant: item.variantTitle,
      quantity: item.quantity,
      price: item.unitPrice,
      imageUrl: product?.thumbnail ? getImageUrl(product.thumbnail) || undefined : item.productThumbnail || undefined,
    }
  })

  return sendEmail({
    to: data.email,
    subject: `Замовлення #${data.orderNumber} підтверджено — HAIR LAB`,
    react: OrderConfirmation({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      items,
      subtotal: data.subtotal,
      shipping: data.shipping,
      discount: data.discount,
      total: data.total,
      currency: data.currency,
      shippingCity: data.shippingCity,
      shippingWarehouse: data.shippingWarehouse,
      paymentMethod: data.paymentMethod,
    }),
    tags: [
      { name: 'type', value: 'order-confirmation' },
      { name: 'order', value: String(data.orderNumber) },
    ],
  })
}

// ─── Welcome Email ─────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, customerName: string) {
  return sendEmail({
    to: email,
    subject: 'Вітаємо в HAIR LAB!',
    react: Welcome({ customerName }),
    tags: [{ name: 'type', value: 'welcome' }],
  })
}

// ─── Shipping Notification Email ───────────────────────────────

interface ShippingEmailData {
  email: string
  customerName: string
  orderNumber: number
  trackingNumber?: string
  carrier?: string
  trackingUrl?: string
  estimatedDelivery?: string
}

export async function sendShippingNotificationEmail(data: ShippingEmailData) {
  return sendEmail({
    to: data.email,
    subject: `Замовлення #${data.orderNumber} відправлено — HAIR LAB`,
    react: ShippingNotification({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      trackingNumber: data.trackingNumber,
      carrier: data.carrier,
      trackingUrl: data.trackingUrl,
      estimatedDelivery: data.estimatedDelivery,
    }),
    tags: [
      { name: 'type', value: 'shipping' },
      { name: 'order', value: String(data.orderNumber) },
    ],
  })
}

// ─── Abandoned Cart Email ──────────────────────────────────────

interface AbandonedCartEmailData {
  email: string
  customerName?: string
  items: CartItem[]
  total: number
  currency?: string
  promoCode?: string
  promoDiscount?: number
}

export async function sendAbandonedCartEmail(data: AbandonedCartEmailData) {
  const items = data.items.map((item) => {
    const product = typeof item.product === 'object' ? (item.product as PayloadProduct) : null
    return {
      name: item.productTitle || product?.title || 'Товар',
      variant: item.variantTitle,
      quantity: item.quantity,
      price: item.unitPrice,
      imageUrl: product?.thumbnail ? getImageUrl(product.thumbnail) || undefined : item.productThumbnail || undefined,
    }
  })

  return sendEmail({
    to: data.email,
    subject: 'Ви забули дещо в кошику — HAIR LAB',
    react: AbandonedCart({
      customerName: data.customerName,
      items,
      total: data.total,
      currency: data.currency,
      promoCode: data.promoCode,
      promoDiscount: data.promoDiscount,
    }),
    tags: [{ name: 'type', value: 'abandoned-cart' }],
  })
}

// ─── Email Verification ──────────────────────────────────────

export async function sendVerificationEmail(email: string, customerName: string, verificationToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'
  const verificationUrl = `${baseUrl}/account/verify-email?token=${verificationToken}`

  return sendEmail({
    to: email,
    subject: 'Підтвердіть вашу email-адресу — HAIR LAB',
    react: EmailVerification({ customerName, verificationUrl }),
    tags: [{ name: 'type', value: 'email-verification' }],
  })
}
