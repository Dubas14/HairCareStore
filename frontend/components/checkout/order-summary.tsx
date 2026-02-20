'use client'

import { useState, useCallback } from 'react'
import { LoyaltyPointsSection } from './loyalty-points-section'

const FREE_SHIPPING_THRESHOLD = 1000

function getImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder-product.jpg'
  return url
}

interface CartLike {
  items: Array<{
    id?: string | number
    productTitle?: string
    productThumbnail?: string
    variantTitle?: string
    quantity: number
    unitPrice: number
  }>
  subtotal: number
  shippingTotal: number
  discountTotal: number
  total: number
}

interface OrderSummaryProps {
  cart: CartLike | null
  showItems?: boolean
}

function OrderItem({ item }: { item: CartLike['items'][number] }) {
  const productName = item.productTitle || 'Товар'
  const variantName = item.variantTitle || 'Стандартний'
  const imageUrl = getImageUrl(item.productThumbnail)
  const price = item.unitPrice

  return (
    <div className="flex gap-3 py-3">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover"
        />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium line-clamp-1">{productName}</h4>
        <p className="text-xs text-muted-foreground">{variantName}</p>
      </div>
      <div className="text-sm font-medium">
        {Math.round(price * item.quantity)} ₴
      </div>
    </div>
  )
}

export function OrderSummary({ cart, showItems = true }: OrderSummaryProps) {
  const items = cart?.items || []
  const subtotal = cart ? cart.subtotal : 0
  const shippingTotal = cart ? cart.shippingTotal : 0
  const cartTotal = cart ? cart.total : 0
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  // Loyalty points state
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)

  const handleLoyaltyPointsChange = useCallback((_points: number, discount: number) => {
    setLoyaltyDiscount(discount)
  }, [])

  const total = cartTotal - loyaltyDiscount

  return (
    <div className="bg-muted/50 rounded-card p-6">
      <h2 className="text-lg font-semibold mb-4">Ваше замовлення</h2>

      {/* Items */}
      {showItems && items.length > 0 && (
        <div className="divide-y divide-border mb-4 max-h-[300px] overflow-y-auto">
          {items.map((item, index) => (
            <OrderItem key={item.id ?? index} item={item} />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Підсумок</span>
          <span>{Math.round(subtotal)} ₴</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Доставка</span>
          <span>
            {isFreeShipping
              ? 'Безкоштовно'
              : shippingTotal > 0
              ? `${Math.round(shippingTotal)} ₴`
              : 'За тарифами НП'}
          </span>
        </div>
        {cart?.discountTotal && cart.discountTotal > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Знижка</span>
            <span>-{Math.round(cart.discountTotal)} ₴</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-sm text-[#2A9D8F]">
            <span>Бонуси</span>
            <span>-{Math.round(loyaltyDiscount)} ₴</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Разом</span>
          <span>{Math.round(total)} ₴</span>
        </div>
      </div>

      {/* Loyalty points section */}
      {cart && subtotal > 0 && (
        <div className="mt-4 pt-4 border-t">
          <LoyaltyPointsSection
            orderTotal={subtotal}
            onPointsChange={handleLoyaltyPointsChange}
          />
        </div>
      )}

      {/* Promo code - TODO: implement backend validation */}
    </div>
  )
}
