import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackSearch,
  trackAddToWishlist,
  trackPurchase,
} from './events'

describe('analytics events', () => {
  let gtagCalls: unknown[][]
  let fbqCalls: unknown[][]

  beforeEach(() => {
    gtagCalls = []
    fbqCalls = []
    window.gtag = (...args: unknown[]) => { gtagCalls.push(args) }
    window.fbq = (...args: unknown[]) => { fbqCalls.push(args) }
  })

  const sampleItem = {
    item_id: '123',
    item_name: 'Test Product',
    item_brand: 'Test Brand',
    price: 100,
    quantity: 1,
  }

  describe('trackPageView', () => {
    it('sends page_view to GA4 and PageView to FB', () => {
      trackPageView('/test', 'Test Page')
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('page_view')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('PageView')
    })
  })

  describe('trackViewItem', () => {
    it('sends view_item event with correct data', () => {
      trackViewItem(sampleItem)
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('view_item')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('ViewContent')
    })
  })

  describe('trackAddToCart', () => {
    it('sends add_to_cart event', () => {
      trackAddToCart(sampleItem)
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('add_to_cart')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('AddToCart')
    })
  })

  describe('trackRemoveFromCart', () => {
    it('sends remove_from_cart event to GA4 only', () => {
      trackRemoveFromCart(sampleItem)
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('remove_from_cart')
      expect(fbqCalls).toHaveLength(0)
    })
  })

  describe('trackBeginCheckout', () => {
    it('sends begin_checkout event', () => {
      trackBeginCheckout([sampleItem], 100)
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('begin_checkout')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('InitiateCheckout')
    })
  })

  describe('trackSearch', () => {
    it('sends search event', () => {
      trackSearch('shampoo')
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('search')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('Search')
    })
  })

  describe('trackAddToWishlist', () => {
    it('sends add_to_wishlist event', () => {
      trackAddToWishlist(sampleItem)
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('add_to_wishlist')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('AddToWishlist')
    })
  })

  describe('trackPurchase', () => {
    it('sends purchase event with transaction ID', () => {
      trackPurchase('order-123', [sampleItem], 100, 50)
      expect(gtagCalls).toHaveLength(1)
      expect(gtagCalls[0][1]).toBe('purchase')
      expect(fbqCalls).toHaveLength(1)
      expect(fbqCalls[0][1]).toBe('Purchase')
    })
  })

  describe('when analytics not loaded', () => {
    it('does not throw when gtag is undefined', () => {
      window.gtag = undefined
      window.fbq = undefined
      expect(() => trackPageView('/test')).not.toThrow()
      expect(() => trackAddToCart(sampleItem)).not.toThrow()
    })
  })
})
