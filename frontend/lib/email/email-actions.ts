'use server'

import { sendEmail } from './send'
import { OrderConfirmation } from './templates/order-confirmation'
import { Welcome } from './templates/welcome'
import { ShippingNotification } from './templates/shipping-notification'
import { AbandonedCart } from './templates/abandoned-cart'
import { EmailVerification } from './templates/email-verification'
import { PriceDropEmail } from './templates/price-drop'
import { ReviewRequest } from './templates/review-request'
import { BackInStock } from './templates/back-in-stock'
import { LoyaltyLevelUp } from './templates/loyalty-level-up'
import { NewsletterConfirmation } from './templates/newsletter-confirmation'
import { getImageUrl } from '@/lib/payload/types'
import type { PayloadProduct, CartItem } from '@/lib/payload/types'

// ─── Email Settings Guard ─────────────────────────────────────

async function isEmailEnabled(type: string): Promise<boolean> {
  try {
    const { getPayload } = await import('payload')
    const cfg = (await import('@payload-config')).default
    const payload = await getPayload({ config: cfg })
    const settings = await payload.findGlobal({ slug: 'email-settings' })
    if (!settings.isActive) return false
    const types = settings.emailTypes as Record<string, boolean> | undefined
    return types?.[type] !== false
  } catch {
    return true // fail open — send if settings unavailable
  }
}

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
  if (!(await isEmailEnabled('orderConfirmation'))) return { success: false, error: 'Disabled' }

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
  if (!(await isEmailEnabled('welcome'))) return { success: false, error: 'Disabled' }

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
  if (!(await isEmailEnabled('shippingNotification'))) return { success: false, error: 'Disabled' }

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
  if (!(await isEmailEnabled('abandonedCart'))) return { success: false, error: 'Disabled' }

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

// ─── Price Drop Notification ──────────────────────────────────

interface PriceDropEmailData {
  email: string
  customerName: string
  items: Array<{
    title: string
    handle: string
    imageUrl?: string
    oldPrice: number
    newPrice: number
  }>
}

export async function sendPriceDropEmail(data: PriceDropEmailData) {
  if (!(await isEmailEnabled('priceDrop'))) return { success: false, error: 'Disabled' }
  if (data.items.length === 0) return { success: false, error: 'No items' }

  return sendEmail({
    to: data.email,
    subject: `Ціна знижена на ${data.items.length} товар${data.items.length > 1 ? 'ів' : ''} — HAIR LAB`,
    react: PriceDropEmail({
      customerName: data.customerName,
      items: data.items,
    }),
    tags: [{ name: 'type', value: 'price-drop' }],
  })
}

// ─── Review Request Email ─────────────────────────────────────

interface ReviewRequestEmailData {
  email: string
  customerName: string
  orderNumber: number
  items: Array<{
    title: string
    handle: string
    imageUrl?: string
  }>
}

export async function sendReviewRequestEmail(data: ReviewRequestEmailData) {
  if (!(await isEmailEnabled('reviewRequest'))) return { success: false, error: 'Disabled' }
  if (data.items.length === 0) return { success: false, error: 'No items' }

  return sendEmail({
    to: data.email,
    subject: `Як вам товари із замовлення #${data.orderNumber}? — HAIR LAB`,
    react: ReviewRequest({
      customerName: data.customerName,
      orderNumber: data.orderNumber,
      items: data.items,
    }),
    tags: [
      { name: 'type', value: 'review-request' },
      { name: 'order', value: String(data.orderNumber) },
    ],
  })
}

// ─── Back in Stock Email ──────────────────────────────────────

interface BackInStockEmailData {
  email: string
  customerName: string
  items: Array<{
    title: string
    handle: string
    imageUrl?: string
    price: number
  }>
}

export async function sendBackInStockEmail(data: BackInStockEmailData) {
  if (!(await isEmailEnabled('backInStock'))) return { success: false, error: 'Disabled' }
  if (data.items.length === 0) return { success: false, error: 'No items' }

  return sendEmail({
    to: data.email,
    subject: `${data.items[0].title} знову в наявності — HAIR LAB`,
    react: BackInStock({
      customerName: data.customerName,
      items: data.items,
    }),
    tags: [{ name: 'type', value: 'back-in-stock' }],
  })
}

// ─── Loyalty Level Up Email ───────────────────────────────────

interface LoyaltyLevelUpEmailData {
  email: string
  customerName: string
  newLevel: 'silver' | 'gold'
  pointsBalance: number
  multiplier: number
}

export async function sendLoyaltyLevelUpEmail(data: LoyaltyLevelUpEmailData) {
  if (!(await isEmailEnabled('loyaltyLevelUp'))) return { success: false, error: 'Disabled' }

  return sendEmail({
    to: data.email,
    subject: `Вітаємо! Ви досягли ${data.newLevel === 'gold' ? 'Золотого' : 'Срібного'} рівня — HAIR LAB`,
    react: LoyaltyLevelUp({
      customerName: data.customerName,
      newLevel: data.newLevel,
      pointsBalance: data.pointsBalance,
      multiplier: data.multiplier,
    }),
    tags: [{ name: 'type', value: 'loyalty-level-up' }],
  })
}

// ─── Newsletter Confirmation Email ────────────────────────────

export async function sendNewsletterConfirmationEmail(email: string, confirmToken: string) {
  if (!(await isEmailEnabled('newsletterConfirmation'))) return { success: false, error: 'Disabled' }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'
  const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${confirmToken}`

  return sendEmail({
    to: email,
    subject: 'Підтвердіть підписку на розсилку — HAIR LAB',
    react: NewsletterConfirmation({ confirmUrl }),
    tags: [{ name: 'type', value: 'newsletter-confirmation' }],
  })
}
