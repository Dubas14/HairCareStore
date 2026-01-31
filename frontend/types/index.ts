/**
 * TypeScript Types
 *
 * CRITICAL: Always use official types from @medusajs/types
 * NEVER define custom types for Medusa entities
 */

// Re-export Medusa types
export type {
  StoreProduct,
  StoreProductVariant,
  StoreCart,
  StoreCartLineItem,
  StoreRegion,
  StoreProductCategory,
  StoreCustomer,
  StoreOrder,
  StoreCollection,
  StorePaymentProvider,
  StoreShippingOption,
} from "@medusajs/types"

// Custom application types
export interface ProductWithCategory extends StoreProduct {
  categories?: StoreProductCategory[]
}

export interface CartWithTotals extends StoreCart {
  subtotal?: number
  tax_total?: number
  shipping_total?: number
  total?: number
}
