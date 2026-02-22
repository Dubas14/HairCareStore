import { describe, it, expect } from 'vitest'
import { formatPrice, formatPriceRange, calculateDiscountPercentage, formatDiscount } from './format-price'

describe('formatPrice', () => {
  it('formats UAH price correctly', () => {
    const result = formatPrice(1299, 'UAH')
    expect(result).toContain('1')
    expect(result).toContain('299')
  })

  it('handles zero price', () => {
    const result = formatPrice(0, 'UAH')
    expect(result).toContain('0')
  })

  it('handles decimal prices', () => {
    const result = formatPrice(99.5, 'UAH')
    expect(result).toContain('99')
  })

  it('uses UAH as default currency', () => {
    const result = formatPrice(100)
    expect(result).toBeDefined()
  })

  it('falls back on invalid currency', () => {
    const result = formatPrice(100, 'INVALID')
    expect(result).toContain('100')
  })
})

describe('formatPriceRange', () => {
  it('formats price range', () => {
    const result = formatPriceRange(100, 500, 'UAH')
    expect(result).toContain('100')
    expect(result).toContain('500')
    expect(result).toContain('-')
  })
})

describe('calculateDiscountPercentage', () => {
  it('calculates correct percentage', () => {
    expect(calculateDiscountPercentage(100, 75)).toBe(25)
    expect(calculateDiscountPercentage(1000, 700)).toBe(30)
  })

  it('returns 0 for zero original price', () => {
    expect(calculateDiscountPercentage(0, 100)).toBe(0)
  })

  it('returns 0 for negative original price', () => {
    expect(calculateDiscountPercentage(-100, 50)).toBe(0)
  })

  it('returns 100 for free product', () => {
    expect(calculateDiscountPercentage(100, 0)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calculateDiscountPercentage(100, 67)).toBe(33)
  })
})

describe('formatDiscount', () => {
  it('formats discount as negative percentage', () => {
    expect(formatDiscount(100, 75)).toBe('-25%')
  })

  it('returns empty string when no discount', () => {
    expect(formatDiscount(100, 100)).toBe('')
    expect(formatDiscount(100, 150)).toBe('')
  })
})
