'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { LoyaltyPointsSection } from './loyalty-points-section'
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants/checkout'

function getImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder-product.jpg'
  const trimmed = url.trim()
  if (trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return '/placeholder-product.jpg'
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
  appliedDiscounts?: Array<{ title: string; type: string; amount: number }>
  promoCode?: string
  promoDiscount?: number
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
        <Image
          src={imageUrl}
          alt={productName}
          width={64}
          height={64}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.jpg' }}
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
  const shippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  // Loyalty points state
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)

  const handleLoyaltyPointsChange = useCallback((_points: number, discount: number) => {
    setLoyaltyDiscount(discount)
  }, [])

  const total = cartTotal - loyaltyDiscount

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-[linear-gradient(180deg,rgba(252,248,242,0.98),rgba(255,255,255,0.98))] p-6 shadow-[0_24px_60px_rgba(16,24,40,0.08)]">
      <div className="mb-5 rounded-[1.5rem] border border-black/6 bg-white/90 p-4 shadow-[0_14px_30px_rgba(16,24,40,0.04)]">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-foreground/45">
          Summary
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Ваше замовлення</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'позиція' : items.length < 5 ? 'позиції' : 'позицій'} у кошику
            </p>
          </div>
          <div className="rounded-full bg-[#1f2a20] px-3 py-1 text-xs font-medium text-white">
            {Math.round(total)} ₴
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-[1.5rem] border border-[#e9e1d4] bg-[#f7efe3] px-4 py-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium text-foreground">Безкоштовна доставка</span>
          <span className="text-muted-foreground">{Math.round(subtotal)} / {FREE_SHIPPING_THRESHOLD} ₴</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/80">
          <div
            className="h-2 rounded-full bg-[#1f2a20] transition-[width] duration-500"
            style={{ width: `${shippingProgress}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          {isFreeShipping
            ? 'Поріг безкоштовної доставки досягнуто.'
            : `Додайте ще ${Math.round(FREE_SHIPPING_THRESHOLD - subtotal)} ₴, щоб доставка стала безкоштовною.`}
        </p>
      </div>

      {/* Items */}
      {showItems && items.length > 0 && (
        <div className="mb-5 max-h-[320px] divide-y divide-border overflow-y-auto rounded-[1.5rem] border border-black/6 bg-white/85 px-4">
          {items.map((item, index) => (
            <OrderItem key={item.id ?? index} item={item} />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="space-y-2 rounded-[1.5rem] border border-black/6 bg-white/85 p-5">
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
              : `від 70 ₴ (безкоштовно від ${FREE_SHIPPING_THRESHOLD} ₴)`}
          </span>
        </div>
        {!isFreeShipping && subtotal > 0 && (
          <div className="text-xs text-muted-foreground">
            До безкоштовної доставки: {Math.round(FREE_SHIPPING_THRESHOLD - subtotal)} ₴
          </div>
        )}
        {cart != null && cart.appliedDiscounts && cart.appliedDiscounts.length > 0 ? (
          cart.appliedDiscounts.map((d, i) => (
            <div key={i} className="flex justify-between text-sm text-success">
              <span>{d.title}</span>
              <span>-{Math.round(d.amount)} ₴</span>
            </div>
          ))
        ) : cart != null && cart.discountTotal > 0 ? (
          <div className="flex justify-between text-sm text-success">
            <span>Знижка</span>
            <span>-{Math.round(cart.discountTotal)} ₴</span>
          </div>
        ) : null}
        {cart != null && (cart.promoDiscount ?? 0) > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Промокод{cart.promoCode ? ` (${cart.promoCode})` : ''}</span>
            <span>-{Math.round(cart.promoDiscount!)} ₴</span>
          </div>
        )}
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-sm text-[#2A9D8F]">
            <span>Бонуси</span>
            <span>-{Math.round(loyaltyDiscount)} ₴</span>
          </div>
        )}
        <div className="flex justify-between border-t pt-3 text-lg font-semibold">
          <span>Разом</span>
          <span>{Math.round(total)} ₴</span>
        </div>
      </div>

      {/* Loyalty points section */}
      {cart && subtotal > 0 && (
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-black/10 bg-white/65 p-4">
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
