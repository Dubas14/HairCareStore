import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/lib/constants/home-data'

const MAX_COMPARE_ITEMS = 4

interface CompareStore {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  clearCompare: () => void
  isInCompare: (productId: number) => boolean
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          if (state.items.length >= MAX_COMPARE_ITEMS) return state
          if (state.items.some((p) => p.id === product.id)) return state
          return { items: [...state.items, product] }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        })),
      clearCompare: () => set({ items: [] }),
      isInCompare: (productId) => get().items.some((p) => p.id === productId),
    }),
    {
      name: 'compare-storage',
    }
  )
)
