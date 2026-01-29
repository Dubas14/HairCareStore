import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedStore {
  productIds: string[]
  addProduct: (productId: string) => void
  clearHistory: () => void
}

const MAX_RECENT_PRODUCTS = 10

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      productIds: [],
      addProduct: (productId) =>
        set((state) => {
          const filtered = state.productIds.filter((id) => id !== productId)
          return {
            productIds: [productId, ...filtered].slice(0, MAX_RECENT_PRODUCTS),
          }
        }),
      clearHistory: () => set({ productIds: [] }),
    }),
    {
      name: 'recently-viewed-storage',
    }
  )
)
