/**
 * Payload CMS shared types and utilities for HAIR LAB
 * Safe to import from both server and client components
 */

// ─── Media helpers ───────────────────────────────────────────────

export interface PayloadMedia {
  id: number | string
  url?: string
  alt?: string
  width?: number
  height?: number
  mimeType?: string
  sizes?: {
    thumbnail?: { url: string; width: number; height: number }
    card?: { url: string; width: number; height: number }
    feature?: { url: string; width: number; height: number }
  }
}

/**
 * Get image URL from Payload media object
 */
export function getImageUrl(image?: PayloadMedia | null): string | null {
  if (!image?.url) return null
  return image.url.startsWith('http') ? image.url : image.url
}

/**
 * Check if media is video based on mime type
 */
export function isVideoMedia(media?: PayloadMedia | null): boolean {
  return media?.mimeType?.startsWith('video/') ?? false
}

// ─── Exported interfaces ─────────────────────────────────────────

export interface Banner {
  id: number | string
  title: string
  image?: PayloadMedia
  link?: string
  position: 'home' | 'category' | 'promo'
  order: number
  isActive: boolean
  mediaType?: 'image' | 'video'
}

export interface PromoBlock {
  id: number | string
  title: string
  description?: any
  image?: PayloadMedia
  buttonText?: string
  buttonLink?: string
  backgroundColor?: string
  isActive: boolean
}

export interface Page {
  id: number | string
  title: string
  slug: string
  content?: any
  featuredImage?: PayloadMedia
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
}

export interface CategoryPromoBlock {
  id?: number | string
  title?: string
  description?: string
  image?: PayloadMedia
  link?: string
  buttonText?: string
}

export interface CategorySeo {
  id?: number | string
  metaTitle?: string
  metaDescription?: string
  ogImage?: PayloadMedia
}

export interface Category {
  id: number | string
  name: string
  slug: string
  description?: any
  shortDescription?: string
  banner?: PayloadMedia
  icon?: PayloadMedia
  accentColor?: string
  subcategories?: Category[]
  parentCategory?: Category | null
  promoBlock?: CategoryPromoBlock
  seo?: CategorySeo
  order: number
  isActive: boolean
}

export interface BenefitItem {
  id?: number | string
  icon: string
  title: string
  description?: string
}

export interface Brand {
  id: number | string
  name: string
  slug: string
  description?: any
  shortDescription?: string
  logo?: PayloadMedia
  banner?: PayloadMedia
  accentColor?: string
  history?: any
  countryOfOrigin?: string
  foundedYear?: number
  website?: string
  benefits?: BenefitItem[]
  seo?: CategorySeo
  order: number
  isActive: boolean
}

// ─── Review types ───────────────────────────────────────────────

export interface Review {
  id: number | string
  customerName: string
  rating: number
  text: string
  product?: PayloadProduct | number | string
  isApproved: boolean
  publishedAt?: string
}

// ─── Blog types ─────────────────────────────────────────────────

export interface BlogPost {
  id: number | string
  title: string
  slug: string
  content?: any
  excerpt?: string
  featuredImage?: PayloadMedia
  author?: string
  tags?: Array<{ tag: string }>
  publishedAt?: string
  status: 'draft' | 'published'
}

// ─── Product types ──────────────────────────────────────────────

export interface PayloadVariant {
  id?: string
  title: string
  sku?: string
  price: number
  compareAtPrice?: number
  inStock: boolean
  inventory: number
}

export interface PayloadProduct {
  id: number | string
  title: string
  handle: string
  subtitle?: string
  description?: any
  thumbnail?: PayloadMedia
  images?: Array<{ image: PayloadMedia }>
  variants: PayloadVariant[]
  options?: Array<{ title: string; values?: Array<{ value: string }> }>
  categories?: Array<Category | number | string>
  brand?: Brand | number | string
  tags?: Array<{ tag: string }>
  status: 'draft' | 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  productId?: number | string
  variantIndex?: number
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

export function transformProduct(doc: PayloadProduct): Product {
  const variant = doc.variants?.[0]
  const price = variant?.price || 0
  const compareAtPrice = variant?.compareAtPrice
  const hasDiscount = compareAtPrice && compareAtPrice > price
  const discount = hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : undefined
  const thumbnailUrl = getImageUrl(doc.thumbnail)
  return {
    id: typeof doc.id === 'string' ? hashStringToNumber(doc.id) : (doc.id as number),
    productId: doc.id,
    variantIndex: 0,
    name: doc.title,
    brand: doc.subtitle || (typeof doc.brand === 'object' && doc.brand ? (doc.brand as Brand).name : 'HAIR LAB'),
    slug: doc.handle,
    imageUrl: thumbnailUrl || '/placeholder-product.jpg',
    price: Math.round(price),
    oldPrice: hasDiscount ? Math.round(compareAtPrice) : undefined,
    rating: 4.5,
    reviewCount: 0,
    discount,
  }
}

export function transformProducts(docs: PayloadProduct[]): Product[] {
  return docs.map(transformProduct)
}

function hashStringToNumber(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export interface CustomerAddress {
  id?: string
  firstName: string
  lastName: string
  phone?: string
  city: string
  address1: string
  countryCode?: string
  postalCode?: string
  isDefaultShipping?: boolean
}

export interface PayloadCustomer {
  id: number | string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addresses?: CustomerAddress[]
  wishlist?: Array<PayloadProduct | number | string>
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id?: string
  product: PayloadProduct | number | string
  variantIndex: number
  variantTitle?: string
  quantity: number
  unitPrice: number
  productTitle?: string
  productThumbnail?: string
}

export interface CartAddress {
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  address1?: string
  countryCode?: string
  postalCode?: string
}

export interface PayloadCart {
  id: number | string
  customer?: PayloadCustomer | number | string
  email?: string
  items: CartItem[]
  shippingAddress?: CartAddress
  billingAddress?: CartAddress
  shippingMethod?: string
  shippingTotal: number
  subtotal: number
  discountTotal: number
  loyaltyPointsUsed: number
  loyaltyDiscount: number
  total: number
  status: 'active' | 'completed' | 'abandoned'
  completedAt?: string
}

export interface OrderItem {
  productId?: number
  productTitle: string
  variantTitle?: string
  quantity: number
  unitPrice: number
  subtotal: number
  thumbnail?: string
}

export interface PayloadOrder {
  id: number | string
  displayId: number
  customer?: PayloadCustomer | number | string
  email: string
  status: 'pending' | 'completed' | 'canceled' | 'requires_action' | 'archived'
  paymentStatus: 'awaiting' | 'paid' | 'refunded'
  fulfillmentStatus: 'not_fulfilled' | 'shipped' | 'delivered'
  items: OrderItem[]
  shippingAddress?: CartAddress
  billingAddress?: CartAddress
  paymentMethod: string
  shippingMethod?: string
  subtotal: number
  shippingTotal: number
  discountTotal: number
  loyaltyPointsUsed: number
  loyaltyDiscount: number
  total: number
  cartId?: string
  createdAt: string
  updatedAt: string
}

export interface ShippingMethod {
  methodId: string
  name: string
  price: number
  freeAbove?: number
  isActive: boolean
}
