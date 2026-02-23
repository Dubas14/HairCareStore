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
 * Get image URL from Payload media object.
 * Validates that URLs use safe protocols (http/https or relative paths).
 */
export function getImageUrl(image?: PayloadMedia | null): string | null {
  if (!image?.url) return null
  const url = image.url.trim()
  // Allow relative paths and http/https URLs only
  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return null
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
  description?: Record<string, unknown> | string | null
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
  content?: Record<string, unknown> | string | null
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
  description?: Record<string, unknown> | string | null
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
  description?: Record<string, unknown> | string | null
  shortDescription?: string
  logo?: PayloadMedia
  banner?: PayloadMedia
  accentColor?: string
  history?: Record<string, unknown> | string | null
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
  images?: Array<{ image: PayloadMedia }>
  verifiedPurchase?: boolean
  isApproved: boolean
  publishedAt?: string
}

// ─── Blog types ─────────────────────────────────────────────────

export interface BlogPost {
  id: number | string
  title: string
  slug: string
  content?: Record<string, unknown> | string | null
  excerpt?: string
  featuredImage?: PayloadMedia
  author?: string
  tags?: Array<{ tag: string }>
  publishedAt?: string
  status: 'draft' | 'published'
}

// ─── Ingredient types ───────────────────────────────────────────

export interface PayloadIngredient {
  id: number | string
  name: string
  benefit: string
  icon?: 'droplets' | 'sparkles' | 'shield' | 'leaf'
  order?: number
}

// ─── Product types ──────────────────────────────────────────────

export interface PayloadVariant {
  id?: string
  title: string
  sku?: string
  price: number
  costPrice?: number
  compareAtPrice?: number
  supplierCode?: string
  articleCode?: string
  inStock: boolean
  inventory: number
}

export interface PayloadProduct {
  id: number | string
  title: string
  handle: string
  barcode?: string
  subtitle?: string
  description?: Record<string, unknown> | string | null
  thumbnail?: PayloadMedia
  images?: Array<{ image: PayloadMedia }>
  variants: PayloadVariant[]
  options?: Array<{ title: string; values?: Array<{ value: string }> }>
  categories?: Array<Category | number | string>
  brand?: Brand | number | string
  tags?: Array<{ tag: string }>
  ingredients?: Array<PayloadIngredient | number | string>
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
    rating: 0,
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
  googleId?: string
  authProvider?: 'local' | 'google'
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

export type CurrencyCode = 'UAH' | 'EUR' | 'PLN' | 'USD'

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
  promoCode?: string
  promoDiscount: number
  total: number
  currency: CurrencyCode
  paymentMethod?: string
  stripePaymentIntentId?: string
  stripeClientSecret?: string
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

// ─── Order status labels & colors (single source of truth) ──────

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'В обробці',
  completed: 'Виконано',
  canceled: 'Скасовано',
  requires_action: 'Потребує дій',
  archived: 'Архів',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  completed: 'bg-success/10 text-success',
  canceled: 'bg-muted text-muted-foreground',
  requires_action: 'bg-orange-500/10 text-orange-600',
  archived: 'bg-muted text-muted-foreground',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  awaiting: 'Очікує оплати',
  paid: 'Оплачено',
  refunded: 'Повернено',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  awaiting: 'bg-yellow-500/10 text-yellow-600',
  paid: 'bg-success/10 text-success',
  refunded: 'bg-muted text-muted-foreground',
}

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  not_fulfilled: 'Не відправлено',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
}

export const FULFILLMENT_STATUS_COLORS: Record<string, string> = {
  not_fulfilled: 'bg-yellow-500/10 text-yellow-600',
  shipped: 'bg-blue-500/10 text-blue-600',
  delivered: 'bg-success/10 text-success',
}

// Hex colors for admin views (inline styles, no Tailwind)
export const ORDER_STATUS_HEX: Record<string, string> = {
  pending: '#e6a84c',
  completed: '#5ba882',
  canceled: '#d4a5a5',
  requires_action: '#c4855a',
  archived: '#9ba5ab',
}

export const PAYMENT_STATUS_HEX: Record<string, string> = {
  awaiting: '#e6a84c',
  paid: '#5ba882',
  refunded: '#d4a5a5',
}

export const FULFILLMENT_STATUS_HEX: Record<string, string> = {
  not_fulfilled: '#e6a84c',
  shipped: '#5b8ec4',
  delivered: '#5ba882',
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
  currency: CurrencyCode
  stripePaymentIntentId?: string
  trackingNumber?: string
  subtotal: number
  shippingTotal: number
  discountTotal: number
  promoCode?: string
  promoDiscount: number
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
  carrier?: string
  price: number
  currency?: string
  freeAbove?: number
  estimatedDays?: string
  isActive: boolean
}

export interface ShippingZone {
  name: string
  countries?: string[]
  isActive: boolean
  methods: ShippingMethod[]
}

export interface ShippingConfig {
  zones?: ShippingZone[]
  methods?: ShippingMethod[]
}

// ─── Loyalty types ──────────────────────────────────────────────

export interface LoyaltyRecord {
  id: number | string
  customer: number | string
  pointsBalance: number
  totalEarned: number
  totalSpent: number
  level: string
  referralCode?: string
  referredBy?: string
  isEnabled: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoyaltyTransaction {
  id: string | number
  customer: string | number
  transactionType: 'earned' | 'spent' | 'expired' | 'welcome' | 'referral' | 'adjustment'
  pointsAmount: number
  orderId: string | null
  description: string | null
  balanceAfter: number
  createdAt: string
}

// ─── Promo types ────────────────────────────────────────────────

export interface PromoConditions {
  maxUsesTotal?: number
  maxUsesPerCustomer?: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  validCategories?: string[]
  validProducts?: string[]
}

// ─── Lexical Rich Text types ────────────────────────────────────

export interface LexicalNode {
  type?: string
  tag?: string
  text?: string
  format?: number | string
  children?: LexicalNode[]
  url?: string
  value?: { url?: string; alt?: string }
  [key: string]: unknown
}
