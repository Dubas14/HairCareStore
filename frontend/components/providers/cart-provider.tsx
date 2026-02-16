'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  getOrCreateCart,
  getCart,
  addToCart as addToCartAction,
  updateCartItem as updateCartItemAction,
  removeCartItem as removeCartItemAction,
  completeCart as completeCartAction,
} from '@/lib/payload/cart-actions'
import type { PayloadCart } from '@/lib/payload/types'

interface CartContextType {
  cart: PayloadCart | null
  isLoading: boolean
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (productId: number | string, variantIndex: number, quantity?: number) => Promise<void>
  updateQuantity: (itemIndex: number, quantity: number) => Promise<void>
  removeItem: (itemIndex: number) => Promise<void>
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<PayloadCart | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCart = useCallback(async () => {
    try {
      const c = await getCart()
      setCart(c)
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), [])

  const addToCart = useCallback(async (productId: number | string, variantIndex: number, quantity = 1) => {
    setIsLoading(true)
    try {
      const updated = await addToCartAction(productId, variantIndex, quantity)
      setCart(updated)
      openCart()
    } finally {
      setIsLoading(false)
    }
  }, [openCart])

  const updateQuantity = useCallback(async (itemIndex: number, quantity: number) => {
    setIsLoading(true)
    try {
      const updated = await updateCartItemAction(itemIndex, quantity)
      setCart(updated)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (itemIndex: number) => {
    setIsLoading(true)
    try {
      const updated = await removeCartItemAction(itemIndex)
      setCart(updated)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearCart = useCallback(() => { setCart(null) }, [])

  const getItemCount = useCallback(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }, [cart?.items])

  const getSubtotal = useCallback(() => cart?.subtotal || 0, [cart])

  return (
    <CartContext.Provider
      value={{ cart, isLoading, isCartOpen, openCart, closeCart, toggleCart, addToCart, updateQuantity, removeItem, clearCart, getItemCount, getSubtotal, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCartContext must be used within a CartProvider')
  return context
}
