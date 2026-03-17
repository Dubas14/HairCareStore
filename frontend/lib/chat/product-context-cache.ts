export interface ProductContext {
  products: string
  categories: string
  brands: string
  fetchedAt: number
}

let cachedContext: ProductContext | null = null

export function getCachedProductContext() {
  return cachedContext
}

export function setCachedProductContext(context: ProductContext) {
  cachedContext = context
  return cachedContext
}

export function invalidateChatCache() {
  cachedContext = null
}
