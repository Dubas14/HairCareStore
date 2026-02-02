import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Customer {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  has_account?: boolean
  created_at: string
  metadata?: Record<string, unknown>
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
        set({
          customer,
          isAuthenticated: !!customer,
          isLoading: false,
        }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({
          customer: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'hair-lab-auth',
      partialize: (state) => ({
        customer: state.customer,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
