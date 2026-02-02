/**
 * Medusa JS SDK Client
 *
 * CRITICAL: This client is configured for Medusa 2.x
 * - publishableKey is REQUIRED for multi-region stores and correct pricing
 * - Without publishableKey, product queries may fail or return incorrect prices
 * - Get publishableKey from Medusa Admin: Settings → Publishable API Keys
 */

import Medusa from "@medusajs/js-sdk"

// Validate required environment variables
const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_MEDUSA_BACKEND_URL is not defined. Please add it to your .env.local file."
  )
}

if (!publishableKey) {
  console.warn(
    "⚠️  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not defined. " +
    "This is REQUIRED for multi-region stores and correct product pricing. " +
    "Get it from Medusa Admin: Settings → Publishable API Keys"
  )
}

/**
 * Medusa SDK instance
 *
 * Usage:
 * ```ts
 * import { sdk } from '@/lib/medusa/client'
 *
 * // Fetch products
 * const { products } = await sdk.store.product.list()
 *
 * // Create cart
 * const { cart } = await sdk.store.cart.create({ region_id: 'region_xxx' })
 * ```
 */
export const sdk = new Medusa({
  baseUrl,
  debug: process.env.NODE_ENV === "development",
  publishableKey,
  auth: {
    type: "session", // Use session-based auth (cookies)
  },
})

/**
 * IMPORTANT: Follow the 5-Step Verification Workflow before using SDK methods
 *
 * 1. PAUSE - Don't write code yet
 * 2. QUERY - Check MCP server or docs for exact method name
 * 3. VERIFY - Confirm method signature and parameters
 * 4. WRITE - Use verified method
 * 5. CHECK - Look for TypeScript errors (errors = wrong method)
 *
 * Resources:
 * - Medusa JS SDK docs: https://docs.medusajs.com/resources/js-sdk
 * - Medusa MCP server: Add HTTP MCP with URL https://docs.medusajs.com/mcp
 */
