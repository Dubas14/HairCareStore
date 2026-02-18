import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const safeStorage = () => ({
  getItem: (name: string) => {
    try { return localStorage.getItem(name) } catch { return null }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value) } catch { /* quota exceeded */ }
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name) } catch { /* ignore */ }
  },
})

export interface Customer {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addresses?: any[]
  wishlist?: any[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt?: string
}

interface AuthState {
  customer: Customer | null
  isAuthenticated: boolean
  isLoading: boolean
  setCustomer: (customer: Customer | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      isAuthenticated: false,
      isLoading: true,
      setCustomer: (customer) =>
        set({ customer, isAuthenticated: !!customer, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({ customer: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'hair-lab-auth',
      storage: createJSONStorage(safeStorage),
      partialize: (state) => ({
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
