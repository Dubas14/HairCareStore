/**
 * TanStack Query Configuration
 *
 * Configured for ecommerce best practices:
 * - Products: 5 min stale time (products don't change often)
 * - Cart: Fresh on every fetch (prices/inventory can change)
 * - Categories: 10 min stale time (rarely change)
 */

import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetch on window focus in production for fresh data
      refetchOnWindowFocus: process.env.NODE_ENV === "production",
      // Retry failed requests once
      retry: 1,
      // Default stale time: 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Don't retry mutations by default
      retry: false,
    },
  },
})

/**
 * Query Keys Factory
 * 
 * Centralized query keys for consistent cache management
 */
export const queryKeys = {
  // Products
  products: {
    all: ["products"] as const,
    lists: () => [...queryKeys.products.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },
  // Categories
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.categories.lists(), filters] as const,
    details: () => [...queryKeys.categories.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  // Cart
  cart: {
    all: ["cart"] as const,
    detail: (cartId: string | null) => [...queryKeys.cart.all, cartId] as const,
  },
  // Customer
  customer: {
    all: ["customer"] as const,
    profile: () => [...queryKeys.customer.all, "profile"] as const,
    orders: () => [...queryKeys.customer.all, "orders"] as const,
  },
  // Regions
  regions: {
    all: ["regions"] as const,
    list: () => [...queryKeys.regions.all, "list"] as const,
  },
} as const
