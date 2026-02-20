import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set — Stripe payments will not work')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

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
