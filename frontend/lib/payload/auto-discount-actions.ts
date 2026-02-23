'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { PayloadProduct } from './types'
import { createLogger } from '@/lib/logger'

const log = createLogger('auto-discount')

interface AppliedDiscount {
  title: string
  type: string
  amount: number
}

interface AutoDiscount {
  id: number | string
  title: string
  type: 'percentage' | 'fixed' | 'buyXgetY'
  value: number
  conditions: {
    minItems?: number
    minOrderAmount?: number
    requiredProducts?: Array<PayloadProduct | number | string>
    requiredCategories?: Array<{ id: number | string } | number | string>
    buyQuantity?: number
    getQuantity?: number
    getDiscountPercent?: number
  }
  priority: number
  stackable: boolean
  startsAt: string
  expiresAt: string
  isActive: boolean
}

interface BundleDiscount {
  id: number | string
  title: string
  products: Array<PayloadProduct | number | string>
  discountType: 'percentage' | 'fixed'
  discountValue: number
  isActive: boolean
}

interface CartItemForDiscount {
  product: PayloadProduct | number | string
  variantIndex: number
  quantity: number
  unitPrice: number
}

function getProductId(product: PayloadProduct | number | string): number | string {
  if (typeof product === 'object' && product !== null) return product.id
  return product
}

function getProductCategories(product: PayloadProduct): Array<number | string> {
  if (!product.categories) return []
  return product.categories.map((c) =>
    typeof c === 'object' && c !== null ? (c as { id: number | string }).id : c
  )
}

/**
 * Recalculate automatic discounts for a cart
 */
async function recalculateAutoDiscounts(
  cartId: number | string,
  items: CartItemForDiscount[],
  subtotal: number,
  resolvedProducts: Map<string | number, PayloadProduct>,
): Promise<AppliedDiscount[]> {
  const payload = await getPayload({ config })

  const now = new Date().toISOString()
  const { docs: discounts } = await payload.find({
    collection: 'automatic-discounts',
    where: {
      isActive: { equals: true },
      startsAt: { less_than_equal: now },
      expiresAt: { greater_than_equal: now },
    },
    sort: '-priority',
    limit: 50,
  })

  const typedDiscounts = discounts as unknown as AutoDiscount[]
  const applied: AppliedDiscount[] = []
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  for (const discount of typedDiscounts) {
    const conditions = discount.conditions || {}

    // Check minItems
    if (conditions.minItems && totalItemCount < conditions.minItems) continue

    // Check minOrderAmount
    if (conditions.minOrderAmount && subtotal < conditions.minOrderAmount) continue

    // Check requiredProducts
    if (conditions.requiredProducts && conditions.requiredProducts.length > 0) {
      const cartProductIds = new Set(items.map((item) => String(getProductId(item.product))))
      const hasAll = conditions.requiredProducts.every((rp) =>
        cartProductIds.has(String(getProductId(rp)))
      )
      if (!hasAll) continue
    }

    // Check requiredCategories
    if (conditions.requiredCategories && conditions.requiredCategories.length > 0) {
      const requiredCatIds = new Set(
        conditions.requiredCategories.map((c) =>
          String(typeof c === 'object' && c !== null ? c.id : c)
        )
      )
      const cartCatIds = new Set<string>()
      for (const item of items) {
        const pid = getProductId(item.product)
        const product = resolvedProducts.get(pid)
        if (product) {
          for (const catId of getProductCategories(product)) {
            cartCatIds.add(String(catId))
          }
        }
      }
      const hasAllCats = [...requiredCatIds].every((cid) => cartCatIds.has(cid))
      if (!hasAllCats) continue
    }

    // Calculate discount amount based on type
    let amount = 0

    if (discount.type === 'percentage') {
      amount = Math.round(subtotal * (discount.value / 100))
    } else if (discount.type === 'fixed') {
      amount = Math.min(discount.value, subtotal)
    } else if (discount.type === 'buyXgetY') {
      const buyQty = conditions.buyQuantity || 1
      const getQty = conditions.getQuantity || 1
      const getDiscountPct = conditions.getDiscountPercent ?? 100
      const groupSize = buyQty + getQty

      if (totalItemCount >= groupSize) {
        // Sort items by price ascending — cheapest get the discount
        const allUnits: { price: number }[] = []
        for (const item of items) {
          for (let i = 0; i < item.quantity; i++) {
            allUnits.push({ price: item.unitPrice })
          }
        }
        allUnits.sort((a, b) => a.price - b.price)

        // How many complete groups of buyX+getY
        const groups = Math.floor(allUnits.length / groupSize)
        let bxgyDiscount = 0
        for (let g = 0; g < groups; g++) {
          // The cheapest "getQty" items in this group get the discount
          for (let i = 0; i < getQty; i++) {
            const unitIdx = g * groupSize + i
            if (unitIdx < allUnits.length) {
              bxgyDiscount += Math.round(allUnits[unitIdx].price * (getDiscountPct / 100))
            }
          }
        }
        amount = bxgyDiscount
      } else {
        continue
      }
    }

    if (amount <= 0) continue

    applied.push({
      title: discount.title,
      type: discount.type,
      amount,
    })

    // If not stackable — stop after first match
    if (!discount.stackable) break
  }

  return applied
}

/**
 * Recalculate bundle discounts for a cart
 */
async function recalculateBundleDiscounts(
  items: CartItemForDiscount[],
  subtotal: number,
): Promise<AppliedDiscount[]> {
  const payload = await getPayload({ config })

  const { docs: bundles } = await payload.find({
    collection: 'product-bundles',
    where: { isActive: { equals: true } },
    limit: 50,
    depth: 0,
  })

  const typedBundles = bundles as unknown as BundleDiscount[]
  const applied: AppliedDiscount[] = []
  const cartProductIds = new Set(items.map((item) => String(getProductId(item.product))))

  for (const bundle of typedBundles) {
    if (!bundle.products || bundle.products.length === 0) continue

    // Check if ALL bundle products are in the cart
    const bundleProductIds = bundle.products.map((p) => String(getProductId(p)))
    const allPresent = bundleProductIds.every((pid) => cartProductIds.has(pid))
    if (!allPresent) continue

    // Calculate bundle items subtotal
    let bundleSubtotal = 0
    for (const item of items) {
      if (bundleProductIds.includes(String(getProductId(item.product)))) {
        bundleSubtotal += item.unitPrice * item.quantity
      }
    }

    let amount = 0
    if (bundle.discountType === 'percentage') {
      amount = Math.round(bundleSubtotal * (bundle.discountValue / 100))
    } else if (bundle.discountType === 'fixed') {
      amount = Math.min(bundle.discountValue, bundleSubtotal)
    }

    if (amount > 0) {
      applied.push({
        title: bundle.title,
        type: `bundle_${bundle.discountType}`,
        amount,
      })
    }
  }

  return applied
}

/**
 * Apply all automatic discounts (auto-discounts + bundles) to a cart.
 * Updates the cart's discountTotal and appliedDiscounts fields.
 */
export async function applyAutoDiscounts(cartId: number | string): Promise<void> {
  try {
    const payload = await getPayload({ config })
    const cart = await payload.findByID({ collection: 'carts', id: cartId, depth: 1 })
    if (!cart) return

    const typedCart = cart as unknown as {
      items: CartItemForDiscount[]
      subtotal: number
      status: string
    }
    if (typedCart.status !== 'active') return

    const items = typedCart.items || []
    if (items.length === 0) {
      await payload.update({
        collection: 'carts',
        id: cartId,
        data: { discountTotal: 0, appliedDiscounts: [] },
      })
      return
    }

    const subtotal = typedCart.subtotal || 0

    // Resolve products for category checks
    const resolvedProducts = new Map<string | number, PayloadProduct>()
    for (const item of items) {
      const pid = getProductId(item.product)
      if (typeof item.product === 'object' && item.product !== null) {
        resolvedProducts.set(pid, item.product as unknown as PayloadProduct)
      } else {
        try {
          const product = await payload.findByID({ collection: 'products', id: pid, depth: 1 })
          if (product) resolvedProducts.set(pid, product as unknown as PayloadProduct)
        } catch { /* skip */ }
      }
    }

    const [autoDiscounts, bundleDiscounts] = await Promise.all([
      recalculateAutoDiscounts(cartId, items, subtotal, resolvedProducts),
      recalculateBundleDiscounts(items, subtotal),
    ])

    const allDiscounts = [...autoDiscounts, ...bundleDiscounts]
    const discountTotal = allDiscounts.reduce((sum, d) => sum + d.amount, 0)

    // Cap discount at subtotal
    const cappedTotal = Math.min(discountTotal, subtotal)

    await payload.update({
      collection: 'carts',
      id: cartId,
      data: {
        discountTotal: cappedTotal,
        appliedDiscounts: allDiscounts,
      },
    })

    log.info(`Applied ${allDiscounts.length} discounts to cart ${cartId}: -${cappedTotal}`)
  } catch (err) {
    log.error('Failed to apply auto discounts', err)
  }
}
