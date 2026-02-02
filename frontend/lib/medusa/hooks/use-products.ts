import { useQuery } from "@tanstack/react-query"
import { sdk } from "../client"

// Region ID for Ukraine (EUR currency)
const DEFAULT_REGION_ID = "reg_01KGA7S8A0WMWH3W0Y8YWGVSJG"

export interface MedusaCategory {
  id: string
  name: string
  handle: string
  description: string | null
}

export interface MedusaProduct {
  id: string
  title: string
  handle: string
  subtitle: string | null
  description: string | null
  thumbnail: string | null
  images: Array<{ id: string; url: string }>
  variants: Array<{
    id: string
    title: string
    sku: string | null
    prices?: Array<{
      id: string
      amount: number
      currency_code: string
    }>
    calculated_price?: {
      calculated_amount: number
      original_amount: number
      currency_code?: string
    }
  }>
  options: Array<{
    id: string
    title: string
    values: Array<{ id: string; value: string }>
  }>
  categories?: MedusaCategory[]
  created_at: string
  updated_at: string
}

interface ProductsResponse {
  products: MedusaProduct[]
  count: number
  offset: number
  limit: number
}

interface UseProductsOptions {
  limit?: number
  offset?: number
}

/**
 * Fetch all products from Medusa
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { limit = 20, offset = 0 } = options

  return useQuery({
    queryKey: ["products", { limit, offset }],
    queryFn: async (): Promise<ProductsResponse> => {
      const response = await sdk.store.product.list({
        limit,
        offset,
        region_id: DEFAULT_REGION_ID,
        fields: "+variants.calculated_price,+images.*",
      })
      return response as unknown as ProductsResponse
    },
  })
}

/**
 * Fetch a single product by handle
 */
export function useProduct(handle: string) {
  return useQuery({
    queryKey: ["product", handle],
    queryFn: async (): Promise<MedusaProduct | null> => {
      const response = await sdk.store.product.list({
        handle,
        region_id: DEFAULT_REGION_ID,
        fields: "+variants.calculated_price,+images.*,+options.*",
        limit: 1,
      })
      const products = (response as unknown as ProductsResponse).products
      return products.length > 0 ? products[0] : null
    },
    enabled: !!handle,
  })
}

/**
 * Helper to get the lowest price from a product
 */
export function getProductPrice(product: MedusaProduct): number {
  // First try calculated_price (preferred)
  const calculatedPrices = product.variants
    .map((v) => v.calculated_price?.calculated_amount)
    .filter((p): p is number => p !== undefined)

  if (calculatedPrices.length > 0) {
    return Math.min(...calculatedPrices)
  }

  // Fallback to prices array
  const prices = product.variants
    .flatMap((v) => v.prices || [])
    .map((p) => p.amount)

  if (prices.length === 0) return 0
  return Math.min(...prices)
}

/**
 * Helper to format price for display
 */
export function formatPrice(amount: number, currencyCode: string = "UAH"): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Search products by query string
 */
export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: async (): Promise<ProductsResponse> => {
      const response = await sdk.store.product.list({
        q: query,
        limit: 20,
        region_id: DEFAULT_REGION_ID,
        fields: "+variants.calculated_price,+images.*",
      })
      return response as unknown as ProductsResponse
    },
    enabled: query.length >= 2,
  })
}

interface UseProductsByCategoryOptions {
  categoryHandle: string
  limit?: number
  offset?: number
}

/**
 * Fetch products by category handle
 * Loads all products and filters by category on client side
 */
export function useProductsByCategory(options: UseProductsByCategoryOptions) {
  const { categoryHandle, limit = 100, offset = 0 } = options

  return useQuery({
    queryKey: ["products", "category", categoryHandle, { limit, offset }],
    queryFn: async (): Promise<ProductsResponse> => {
      // Fetch all products with categories
      const response = await sdk.store.product.list({
        limit,
        offset,
        region_id: DEFAULT_REGION_ID,
        fields: "+variants.calculated_price,+images.*,+categories.*",
      })

      const allProducts = (response as unknown as ProductsResponse).products

      // Filter by category handle on client side
      const filteredProducts = allProducts.filter((product) =>
        product.categories?.some((cat) => cat.handle === categoryHandle)
      )

      return {
        products: filteredProducts,
        count: filteredProducts.length,
        offset,
        limit,
      }
    },
    enabled: !!categoryHandle,
  })
}

/**
 * Fetch all products (for server-side rendering)
 */
export async function fetchProducts(options: UseProductsOptions = {}): Promise<ProductsResponse> {
  const { limit = 100, offset = 0 } = options
  const response = await sdk.store.product.list({
    limit,
    offset,
    region_id: DEFAULT_REGION_ID,
    fields: "+variants.calculated_price,+images.*,+categories.*",
  })
  return response as unknown as ProductsResponse
}

/**
 * Fetch products by category (for server-side rendering)
 * Loads all products and filters by category handle
 */
export async function fetchProductsByCategory(
  categoryHandle: string,
  options: UseProductsOptions = {}
): Promise<ProductsResponse> {
  const { limit = 100, offset = 0 } = options
  const response = await sdk.store.product.list({
    limit,
    offset,
    region_id: DEFAULT_REGION_ID,
    fields: "+variants.calculated_price,+images.*,+categories.*",
  })

  const allProducts = (response as unknown as ProductsResponse).products

  // Filter by category handle
  const filteredProducts = allProducts.filter((product) =>
    product.categories?.some((cat) => cat.handle === categoryHandle)
  )

  return {
    products: filteredProducts,
    count: filteredProducts.length,
    offset,
    limit,
  }
}
