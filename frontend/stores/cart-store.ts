import { create } from 'zustand'
import { persist, type StateStorage } from 'zustand/middleware'

const safeStorage: StateStorage = {
  getItem: (name) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name, value) => {
    try { localStorage.setItem(name, value) } catch { /* quota exceeded or unavailable */ }
  },
  removeItem: (name) => {
    try { localStorage.removeItem(name) } catch { /* ignore */ }
  },
}

export interface CartItem {
  id: string
  productId: number
  name: string
  brand: string
  variant: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartStore {
  cartId: string | null
  items: CartItem[]
  isOpen: boolean

  // Cart ID management
  setCartId: (id: string | null) => void

  // Item management
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void

  // Drawer
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartId: null,
      items: [],
      isOpen: false,

      setCartId: (id) => set({ cartId: id }),

      addItem: (item) => {
        const items = get().items
        const existingItem = items.find(
          (i) => i.productId === item.productId && i.variant === item.variant
        )

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          const newItem: CartItem = {
            ...item,
            id: `${item.productId}-${item.variant}-${Date.now()}`,
          }
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.id !== itemId) })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === itemId ? { ...i, quantity: Math.min(quantity, 10) } : i
          ),
        })
      },

      clearCart: () => set({ cartId: null, items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
      storage: safeStorage,
      partialize: (state) => ({
        cartId: state.cartId,
        items: state.items,
      }),
    }
  )
)
