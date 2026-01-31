/**
 * TypeScript Types for HairCareStore
 */

// Product types (matching home-data.ts)
export interface Product {
  id: number
  name: string
  brand: string
  slug: string
  imageUrl: string
  price: number
  oldPrice?: number
  rating: number
  reviewCount: number
  discount?: number
  badge?: string
}

// Category types
export interface Category {
  id: number
  name: string
  slug: string
  productCount: number
  imageUrl: string
}

// Brand types
export interface Brand {
  id: number
  name: string
  slug: string
  logoUrl: string
}

// Cart types
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

// Filter types
export interface FilterState {
  concerns: string[]
  hairTypes: string[]
  brands: string[]
  priceRange: [number, number]
}

// Checkout types
export interface ContactInfo {
  email: string
  phone: string
  firstName: string
  lastName: string
}

export interface ShippingInfo {
  method: 'courier' | 'nova-poshta' | 'pickup'
  city: string
  address: string
  warehouse?: string
}

export interface PaymentInfo {
  method: 'card' | 'liqpay' | 'cash'
}
