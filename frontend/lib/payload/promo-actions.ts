'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { PromoConditions } from './types'

interface PromoValidationResult {
  valid: boolean
  discount: number
  message: string
  promoType?: 'percentage' | 'fixed' | 'free_shipping'
}

/**
 * Validate a promo code against the current cart
 */
export async function validatePromoCode(
  code: string,
  cartId: string | number,
  email?: string,
): Promise<PromoValidationResult> {
  if (!code?.trim()) {
    return { valid: false, discount: 0, message: 'Введіть промокод' }
  }

  try {
    const payload = await getPayload({ config })
    const normalizedCode = code.toUpperCase().trim()

    // Find the promotion
    const promoResult = await payload.find({
      collection: 'promotions',
      where: {
        code: { equals: normalizedCode },
        isActive: { equals: true },
      },
      limit: 1,
    })

    const promo = promoResult.docs[0]
    if (!promo) {
      return { valid: false, discount: 0, message: 'Промокод не знайдено' }
    }

    // Check dates
    const now = new Date()
    if (promo.startsAt && new Date(promo.startsAt) > now) {
      return { valid: false, discount: 0, message: 'Промокод ще не активний' }
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < now) {
      return { valid: false, discount: 0, message: 'Промокод прострочений' }
    }

    // Check total usage limit
    const conditions = promo.conditions as PromoConditions | undefined
    if (conditions?.maxUsesTotal && promo.usageCount >= conditions.maxUsesTotal) {
      return { valid: false, discount: 0, message: 'Промокод вичерпано' }
    }

    // Check per-customer usage limit
    if (email && conditions?.maxUsesPerCustomer) {
      const usageResult = await payload.find({
        collection: 'promotion-usages',
        where: {
          promotion: { equals: promo.id },
          email: { equals: email },
        },
        limit: 0,
      })
      if (usageResult.totalDocs >= conditions.maxUsesPerCustomer) {
        return { valid: false, discount: 0, message: 'Ви вже використали цей промокод' }
      }
    }

    // Get cart to calculate discount
    const cart = await payload.findByID({
      collection: 'carts',
      id: cartId,
    })

    if (!cart) {
      return { valid: false, discount: 0, message: 'Кошик не знайдено' }
    }

    const subtotal = cart.subtotal || 0

    // Check minimum order amount
    if (conditions?.minOrderAmount && subtotal < conditions.minOrderAmount) {
      return {
        valid: false,
        discount: 0,
        message: `Мінімальна сума замовлення: ${conditions.minOrderAmount} ${cart.currency || 'UAH'}`,
      }
    }

    // Calculate discount
    let discount = 0
    const promoType = promo.type as 'percentage' | 'fixed' | 'free_shipping'

    switch (promoType) {
      case 'percentage': {
        discount = Math.round(subtotal * (promo.value / 100))
        if (conditions?.maxDiscountAmount && discount > conditions.maxDiscountAmount) {
          discount = conditions.maxDiscountAmount
        }
        break
      }
      case 'fixed': {
        discount = promo.value
        if (discount > subtotal) discount = subtotal
        break
      }
      case 'free_shipping': {
        discount = cart.shippingTotal || 0
        break
      }
    }

    const title = typeof promo.title === 'string' ? promo.title : promo.code
    return {
      valid: true,
      discount: Math.round(discount),
      message: `Промокод "${normalizedCode}" застосовано! Знижка: ${discount} ${cart.currency || 'UAH'}`,
      promoType,
    }
  } catch (error) {
    console.error('Error validating promo code:', error)
    return { valid: false, discount: 0, message: 'Помилка перевірки промокоду' }
  }
}

/**
 * Apply a validated promo code to the cart
 */
export async function applyPromoCode(
  code: string,
  cartId: string | number,
  email?: string,
): Promise<{ success: boolean; message: string; discount: number }> {
  const validation = await validatePromoCode(code, cartId, email)

  if (!validation.valid) {
    return { success: false, message: validation.message, discount: 0 }
  }

  try {
    const payload = await getPayload({ config })
    const normalizedCode = code.toUpperCase().trim()

    // Get current cart
    const cart = await payload.findByID({ collection: 'carts', id: cartId })
    if (!cart) {
      return { success: false, message: 'Кошик не знайдено', discount: 0 }
    }

    // Calculate new total
    const subtotal = cart.subtotal || 0
    const shippingTotal = validation.promoType === 'free_shipping'
      ? 0
      : (cart.shippingTotal || 0)
    const discountTotal = (cart.discountTotal || 0)
    const loyaltyDiscount = (cart.loyaltyDiscount || 0)
    const total = subtotal + shippingTotal - discountTotal - loyaltyDiscount - validation.discount

    // Update cart with promo
    await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        promoCode: normalizedCode,
        promoDiscount: validation.discount,
        total: Math.max(0, total),
        ...(validation.promoType === 'free_shipping' ? { shippingTotal: 0 } : {}),
      },
    })

    return {
      success: true,
      message: validation.message,
      discount: validation.discount,
    }
  } catch (error) {
    console.error('Error applying promo code:', error)
    return { success: false, message: 'Помилка застосування промокоду', discount: 0 }
  }
}

/**
 * Remove promo code from cart
 */
export async function removePromoCode(
  cartId: string | number,
): Promise<{ success: boolean; message: string }> {
  try {
    const payload = await getPayload({ config })

    const cart = await payload.findByID({ collection: 'carts', id: cartId })
    if (!cart) {
      return { success: false, message: 'Кошик не знайдено' }
    }

    await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        promoCode: '',
        promoDiscount: 0,
      },
    })

    return { success: true, message: 'Промокод видалено' }
  } catch (error) {
    console.error('Error removing promo code:', error)
    return { success: false, message: 'Помилка видалення промокоду' }
  }
}

/**
 * Record promo code usage after order completion
 */
export async function recordPromoUsage(
  code: string,
  email: string,
  orderId: number,
  discountAmount: number,
  currency: string = 'UAH',
  customerId?: string | number,
): Promise<void> {
  try {
    const payload = await getPayload({ config })
    const normalizedCode = code.toUpperCase().trim()

    // Find promotion
    const promoResult = await payload.find({
      collection: 'promotions',
      where: { code: { equals: normalizedCode } },
      limit: 1,
    })

    const promo = promoResult.docs[0]
    if (!promo) return

    // Create usage record
    await payload.create({
      collection: 'promotion-usages',
      data: {
        promotion: promo.id,
        customer: customerId || undefined,
        email,
        orderId,
        discountAmount,
        currency,
      },
    })

    // Increment usage count
    await payload.update({
      collection: 'promotions',
      id: promo.id,
      data: {
        usageCount: (promo.usageCount || 0) + 1,
      },
    })
  } catch (error) {
    console.error('Error recording promo usage:', error)
  }
}
