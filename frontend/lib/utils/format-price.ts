/**
 * Price Formatting Utilities
 *
 * CRITICAL: Prices are stored AS-IS (not in cents like Stripe)
 * DO NOT divide by 100!
 */

/**
 * Format price with currency symbol
 *
 * @param amount - Price amount (already in display format, DO NOT divide by 100)
 * @param currencyCode - ISO currency code (UAH, USD, EUR, etc.)
 * @param locale - Locale for formatting (default: uk-UA for Ukrainian)
 * @returns Formatted price string
 *
 * @example
 * formatPrice(1299, 'UAH') // "1 299,00 ₴"
 * formatPrice(99.99, 'USD') // "$99.99"
 */
export function formatPrice(
  amount: number,
  currencyCode: string = "UAH",
  locale: string = "uk-UA"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    console.error("Error formatting price:", error)
    return `${amount} ${currencyCode}`
  }
}

/**
 * Format price range (min-max)
 *
 * @example
 * formatPriceRange(999, 1999, 'UAH') // "999 ₴ - 1 999 ₴"
 */
export function formatPriceRange(
  minAmount: number,
  maxAmount: number,
  currencyCode: string = "UAH",
  locale: string = "uk-UA"
): string {
  const min = formatPrice(minAmount, currencyCode, locale)
  const max = formatPrice(maxAmount, currencyCode, locale)
  return `${min} - ${max}`
}

/**
 * Calculate discount percentage
 *
 * @example
 * calculateDiscountPercentage(1299, 999) // 23
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  discountedPrice: number
): number {
  if (originalPrice <= 0) return 0
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * Format discount percentage for display
 *
 * @example
 * formatDiscount(1299, 999) // "-23%"
 */
export function formatDiscount(
  originalPrice: number,
  discountedPrice: number
): string {
  const percentage = calculateDiscountPercentage(originalPrice, discountedPrice)
  return percentage > 0 ? `-${percentage}%` : ""
}
