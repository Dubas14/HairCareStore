import type { Product } from "@/lib/constants/home-data"
import type { MedusaProduct } from "./hooks/use-products"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

/**
 * Get full image URL (prepend backend URL for relative paths)
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholder-product.jpg"
  // If already absolute URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  // Prepend backend URL for relative paths
  return `${MEDUSA_BACKEND_URL}${url}`
}

/**
 * Convert Medusa product to frontend Product format
 * Note: Medusa v2 stores prices in major units (no division needed)
 */
export function toFrontendProduct(medusaProduct: MedusaProduct): Product {
  const variant = medusaProduct.variants?.[0]
  const calculatedPrice = variant?.calculated_price?.calculated_amount
  const originalPrice = variant?.calculated_price?.original_amount

  // Use calculated_price if available, otherwise fallback to prices array
  const price = calculatedPrice
    ? calculatedPrice
    : variant?.prices?.[0]?.amount
    ? variant.prices[0].amount
    : 0

  // Check if there's a sale (original price differs from calculated)
  const oldPrice =
    originalPrice && calculatedPrice && originalPrice > calculatedPrice
      ? originalPrice
      : undefined

  return {
    id: hashStringToNumber(medusaProduct.id), // Convert string ID to number
    name: medusaProduct.title,
    brand: medusaProduct.subtitle || "HAIR LAB",
    slug: medusaProduct.handle,
    imageUrl: getImageUrl(medusaProduct.thumbnail),
    price,
    rating: 4.5, // Default rating (Medusa doesn't have ratings by default)
    reviewCount: 0, // Default review count
    oldPrice,
    discount: undefined,
    badge: undefined,
  }
}

/**
 * Convert array of Medusa products to frontend format
 */
export function toFrontendProducts(medusaProducts: MedusaProduct[]): Product[] {
  return medusaProducts.map(toFrontendProduct)
}

/**
 * Simple hash function to convert string ID to number
 * This is needed because existing components expect numeric IDs
 */
function hashStringToNumber(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
