import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../client"

const CART_ID_KEY = "medusa_cart_id"

export interface MedusaCartItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  subtotal: number
  thumbnail: string | null
  variant: {
    id: string
    title: string
    product: {
      id: string
      title: string
      handle: string
      subtitle: string | null
      thumbnail: string | null
    }
  }
}

export interface MedusaAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  postal_code: string
  country_code: string
  phone?: string
}

export interface MedusaShippingMethod {
  id: string
  shipping_option_id: string
  amount: number
  name?: string
}

export interface MedusaPaymentCollection {
  id: string
  payment_sessions?: Array<{
    id: string
    provider_id: string
    status: string
  }>
}

export interface MedusaCart {
  id: string
  email?: string
  region_id: string
  currency_code: string
  items: MedusaCartItem[]
  subtotal: number
  total: number
  shipping_total: number
  discount_total: number
  tax_total: number
  shipping_address?: MedusaAddress
  billing_address?: MedusaAddress
  shipping_methods?: MedusaShippingMethod[]
  payment_collection?: MedusaPaymentCollection
}

interface CartResponse {
  cart: MedusaCart
}

/**
 * Get cart ID from localStorage
 */
export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(CART_ID_KEY)
}

/**
 * Store cart ID in localStorage
 */
export function setStoredCartId(cartId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CART_ID_KEY, cartId)
}

/**
 * Remove cart ID from localStorage
 */
export function clearStoredCartId(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CART_ID_KEY)
}

/**
 * Fetch cart from Medusa
 */
export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async (): Promise<MedusaCart | null> => {
      const cartId = getStoredCartId()
      if (!cartId) return null

      try {
        const response = await sdk.store.cart.retrieve(cartId, {
          fields: "+items.variant.product.*",
        })
        const cart = (response as CartResponse).cart

        // Check if cart is already completed
        if ((cart as unknown as { completed_at?: string }).completed_at) {
          clearStoredCartId()
          return null
        }

        return cart
      } catch (error) {
        // Cart not found, expired, or already completed
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('already completed') || errorMessage.includes('not found')) {
          clearStoredCartId()
        }
        clearStoredCartId()
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Create a new cart
 */
export function useCreateCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (regionId: string): Promise<MedusaCart> => {
      const response = await sdk.store.cart.create({
        region_id: regionId,
      })
      const cart = (response as CartResponse).cart
      setStoredCartId(cart.id)
      return cart
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart)
    },
  })
}

/**
 * Add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cartId,
      variantId,
      quantity,
    }: {
      cartId: string
      variantId: string
      quantity: number
    }): Promise<MedusaCart> => {
      const response = await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity,
      })
      return (response as CartResponse).cart
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart)
    },
  })
}

/**
 * Update item quantity in cart
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cartId,
      itemId,
      quantity,
    }: {
      cartId: string
      itemId: string
      quantity: number
    }): Promise<MedusaCart> => {
      const response = await sdk.store.cart.updateLineItem(cartId, itemId, {
        quantity,
      })
      return (response as CartResponse).cart
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart)
    },
  })
}

/**
 * Remove item from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cartId,
      itemId,
    }: {
      cartId: string
      itemId: string
    }): Promise<MedusaCart> => {
      const response = await sdk.store.cart.deleteLineItem(cartId, itemId)
      // deleteLineItem returns { parent: cart }
      return (response as { parent: MedusaCart }).parent
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart)
    },
  })
}

// ============ Checkout Hooks ============

export interface UpdateCartData {
  email?: string
  shipping_address?: MedusaAddress
  billing_address?: MedusaAddress
}

/**
 * Update cart (email, shipping/billing address)
 */
export function useUpdateCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cartId,
      data,
    }: {
      cartId: string
      data: UpdateCartData
    }): Promise<MedusaCart> => {
      const response = await sdk.store.cart.update(cartId, data)
      return (response as CartResponse).cart
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart)
    },
  })
}

export interface MedusaShippingOption {
  id: string
  name: string
  amount: number
  price_type: string
}

interface ShippingOptionsResponse {
  shipping_options: MedusaShippingOption[]
}

/**
 * Fetch available shipping options for a cart
 */
export function useShippingOptions(cartId: string | undefined) {
  return useQuery({
    queryKey: ["shipping-options", cartId],
    queryFn: async (): Promise<MedusaShippingOption[]> => {
      if (!cartId) return []
      const response = await sdk.store.fulfillment.listCartOptions({
        cart_id: cartId,
      })
      return (response as ShippingOptionsResponse).shipping_options || []
    },
    enabled: !!cartId,
  })
}

/**
 * Add shipping method to cart
 */
export function useAddShippingMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cartId,
      optionId,
    }: {
      cartId: string
      optionId: string
    }): Promise<MedusaCart> => {
      const response = await sdk.store.cart.addShippingMethod(cartId, {
        option_id: optionId,
      })
      return (response as CartResponse).cart
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart)
    },
  })
}

export interface MedusaPaymentProvider {
  id: string
}

interface PaymentProvidersResponse {
  payment_providers: MedusaPaymentProvider[]
}

/**
 * Fetch available payment providers for region
 */
export function usePaymentProviders(regionId: string | undefined) {
  return useQuery({
    queryKey: ["payment-providers", regionId],
    queryFn: async (): Promise<MedusaPaymentProvider[]> => {
      if (!regionId) return []
      const response = await sdk.store.payment.listPaymentProviders({
        region_id: regionId,
      })
      return (response as PaymentProvidersResponse).payment_providers || []
    },
    enabled: !!regionId,
  })
}

interface PaymentCollectionResponse {
  payment_collection: MedusaPaymentCollection
}

/**
 * Initialize payment session for cart
 * This automatically creates payment collection if it doesn't exist
 * For COD use provider_id: "pp_system_default"
 */
export function useInitiatePaymentSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      cart,
      providerId,
    }: {
      cart: MedusaCart
      providerId: string
    }): Promise<MedusaPaymentCollection> => {
      // initiatePaymentSession accepts cart object and creates payment collection automatically
      const response = await sdk.store.payment.initiatePaymentSession(
        cart as Parameters<typeof sdk.store.payment.initiatePaymentSession>[0],
        {
          provider_id: providerId,
        }
      )
      return (response as PaymentCollectionResponse).payment_collection
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] })
    },
  })
}

/**
 * @deprecated Use useInitiatePaymentSession instead
 */
export function useInitiatePayment() {
  return useInitiatePaymentSession()
}

export interface MedusaOrder {
  id: string
  display_id: number
  email: string
  total: number
  currency_code: string
}

interface CompleteCartResponse {
  type: "order" | "cart"
  order?: MedusaOrder
  cart?: MedusaCart
  error?: { message: string }
}

/**
 * Complete cart and place order
 */
export function useCompleteCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (cartId: string): Promise<CompleteCartResponse> => {
      const response = await sdk.store.cart.complete(cartId)
      return response as CompleteCartResponse
    },
    onSuccess: (result) => {
      if (result.type === "order") {
        // Clear cart from cache and localStorage
        queryClient.setQueryData(["cart"], null)
        clearStoredCartId()
      }
    },
  })
}
