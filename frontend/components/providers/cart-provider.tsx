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
  useCart,
  useCreateCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  getStoredCartId,
  clearStoredCartId,
  type MedusaCart,
} from '@/lib/medusa/hooks'
import { useDefaultRegion } from '@/lib/medusa/hooks'

interface CartContextType {
  cart: MedusaCart | null
  isLoading: boolean
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addToCart: (variantId: string, quantity: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

const CartContext = createContext<CartContextType | null>(null)

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { data: cart, isLoading: isCartLoading, refetch: refetchCart } = useCart()
  const { data: defaultRegion, isLoading: isRegionLoading } = useDefaultRegion()
  const createCartMutation = useCreateCart()
  const addToCartMutation = useAddToCart()
  const updateItemMutation = useUpdateCartItem()
  const removeItemMutation = useRemoveFromCart()

  // Initialize cart when region is loaded and no cart exists
  useEffect(() => {
    if (isInitialized || isRegionLoading || isCartLoading) return

    const cartId = getStoredCartId()
    if (!cartId && defaultRegion) {
      // No cart exists, create one
      createCartMutation.mutate(defaultRegion.id, {
        onSuccess: () => {
          setIsInitialized(true)
        },
      })
    } else {
      setIsInitialized(true)
    }
  }, [isInitialized, isRegionLoading, isCartLoading, defaultRegion, createCartMutation])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), [])

  const addToCart = useCallback(
    async (variantId: string, quantity: number) => {
      let cartId = cart?.id

      // Create cart if doesn't exist
      if (!cartId && defaultRegion) {
        const newCart = await createCartMutation.mutateAsync(defaultRegion.id)
        cartId = newCart.id
      }

      if (!cartId) {
        throw new Error('Не вдалося створити кошик')
      }

      await addToCartMutation.mutateAsync({ cartId, variantId, quantity })
      openCart() // Open cart after adding
    },
    [cart?.id, defaultRegion, createCartMutation, addToCartMutation, openCart]
  )

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!cart?.id) return

      if (quantity <= 0) {
        await removeItemMutation.mutateAsync({ cartId: cart.id, itemId })
      } else {
        await updateItemMutation.mutateAsync({ cartId: cart.id, itemId, quantity })
      }
    },
    [cart?.id, updateItemMutation, removeItemMutation]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      if (!cart?.id) return
      await removeItemMutation.mutateAsync({ cartId: cart.id, itemId })
    },
    [cart?.id, removeItemMutation]
  )

  const clearCart = useCallback(() => {
    clearStoredCartId()
    refetchCart()
  }, [refetchCart])

  const getItemCount = useCallback(() => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }, [cart?.items])

  const getSubtotal = useCallback(() => {
    if (!cart) return 0
    // Medusa v2 stores prices in major units
    return cart.subtotal || 0
  }, [cart])

  const isLoading =
    isCartLoading ||
    isRegionLoading ||
    createCartMutation.isPending ||
    addToCartMutation.isPending ||
    updateItemMutation.isPending ||
    removeItemMutation.isPending

  return (
    <CartContext.Provider
      value={{
        cart: cart || null,
        isLoading,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getItemCount,
        getSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCartContext must be used within a CartProvider')
  }
  return context
}
