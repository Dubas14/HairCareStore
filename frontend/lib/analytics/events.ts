/**
 * Unified e-commerce analytics event tracking
 * Supports GA4 and Facebook Pixel
 */

type EcommerceItem = {
  item_id: string
  item_name: string
  item_brand?: string
  item_category?: string
  price?: number
  quantity?: number
  discount?: number
  currency?: string
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

// ─── Page Views ──────────────────────────────────────────────

export function trackPageView(url: string, title?: string) {
  gtag('event', 'page_view', { page_location: url, page_title: title })
  fbq('track', 'PageView')
}

// ─── E-commerce Events ───────────────────────────────────────

export function trackViewItem(item: EcommerceItem, currency = 'UAH') {
  gtag('event', 'view_item', {
    currency,
    value: item.price,
    items: [item],
  })
  fbq('track', 'ViewContent', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: 'product',
    value: item.price,
    currency,
  })
}

export function trackViewItemList(items: EcommerceItem[], listName: string, currency = 'UAH') {
  gtag('event', 'view_item_list', {
    item_list_name: listName,
    currency,
    items,
  })
  fbq('track', 'ViewContent', {
    content_type: 'product_group',
    content_ids: items.map(i => i.item_id),
    currency,
  })
}

export function trackAddToCart(item: EcommerceItem, currency = 'UAH') {
  gtag('event', 'add_to_cart', {
    currency,
    value: (item.price || 0) * (item.quantity || 1),
    items: [item],
  })
  fbq('track', 'AddToCart', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_type: 'product',
    value: (item.price || 0) * (item.quantity || 1),
    currency,
  })
}

export function trackRemoveFromCart(item: EcommerceItem, currency = 'UAH') {
  gtag('event', 'remove_from_cart', {
    currency,
    value: (item.price || 0) * (item.quantity || 1),
    items: [item],
  })
}

export function trackBeginCheckout(items: EcommerceItem[], value: number, currency = 'UAH') {
  gtag('event', 'begin_checkout', {
    currency,
    value,
    items,
  })
  fbq('track', 'InitiateCheckout', {
    content_ids: items.map(i => i.item_id),
    num_items: items.length,
    value,
    currency,
  })
}

export function trackAddShippingInfo(items: EcommerceItem[], shippingTier: string, value: number, currency = 'UAH') {
  gtag('event', 'add_shipping_info', {
    currency,
    value,
    shipping_tier: shippingTier,
    items,
  })
}

export function trackAddPaymentInfo(items: EcommerceItem[], paymentType: string, value: number, currency = 'UAH') {
  gtag('event', 'add_payment_info', {
    currency,
    value,
    payment_type: paymentType,
    items,
  })
  fbq('track', 'AddPaymentInfo', {
    content_ids: items.map(i => i.item_id),
    value,
    currency,
  })
}

export function trackPurchase(
  transactionId: string,
  items: EcommerceItem[],
  value: number,
  shipping: number,
  currency = 'UAH'
) {
  gtag('event', 'purchase', {
    transaction_id: transactionId,
    currency,
    value,
    shipping,
    items,
  })
  fbq('track', 'Purchase', {
    content_ids: items.map(i => i.item_id),
    content_type: 'product',
    num_items: items.length,
    value,
    currency,
  })
}

// ─── Search ──────────────────────────────────────────────────

export function trackSearch(searchTerm: string) {
  gtag('event', 'search', { search_term: searchTerm })
  fbq('track', 'Search', { search_string: searchTerm })
}

// ─── Wishlist ────────────────────────────────────────────────

export function trackAddToWishlist(item: EcommerceItem, currency = 'UAH') {
  gtag('event', 'add_to_wishlist', {
    currency,
    value: item.price,
    items: [item],
  })
  fbq('track', 'AddToWishlist', {
    content_ids: [item.item_id],
    content_name: item.item_name,
    value: item.price,
    currency,
  })
}
