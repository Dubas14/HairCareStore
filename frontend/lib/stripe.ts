import Stripe from 'stripe'
import { createLogger } from '@/lib/logger'

const log = createLogger('stripe')

function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    // Return a proxy that throws a descriptive error on any method call
    // instead of silently returning null and causing cryptic TypeErrors
    return new Proxy({} as Stripe, {
      get(_, prop) {
        if (prop === 'then' || prop === Symbol.toPrimitive || prop === Symbol.toStringTag) return undefined
        throw new Error(
          `STRIPE_SECRET_KEY is not set. Cannot use Stripe.${String(prop)}. ` +
          'Set STRIPE_SECRET_KEY in your environment variables to enable payments.'
        )
      },
    })
  }
  return new Stripe(key, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  })
}

export const stripe = createStripeClient()

/**
 * Supported currencies with their display info
 */
export const SUPPORTED_CURRENCIES = {
  UAH: { code: 'UAH', symbol: '₴', name: 'Українська гривня', stripeCode: 'uah' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', stripeCode: 'eur' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polski złoty', stripeCode: 'pln' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', stripeCode: 'usd' },
} as const

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES

/**
 * Convert major currency units to Stripe minor units (cents/kopecks)
 * Stripe expects amounts in the smallest currency unit
 */
export function toStripeAmount(amount: number, currency: CurrencyCode): number {
  // All our supported currencies use 2 decimal places
  return Math.round(amount * 100)
}

/**
 * Convert Stripe minor units back to major currency units
 */
export function fromStripeAmount(amount: number, currency: CurrencyCode): number {
  return amount / 100
}
