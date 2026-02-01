'use client'

import type { MedusaCart, MedusaCartItem } from '@/lib/medusa/hooks'

const FREE_SHIPPING_THRESHOLD = 1000

interface OrderSummaryProps {
  cart: MedusaCart | null
  showItems?: boolean
}

function OrderItem({ item }: { item: MedusaCartItem }) {
  const productName = item.variant?.product?.title || item.title
  const brand = item.variant?.product?.subtitle || 'HAIR LAB'
  const variantName = item.variant?.title || 'Стандартний'
  const imageUrl = item.thumbnail || item.variant?.product?.thumbnail || '/placeholder-product.jpg'
  const price = item.unit_price

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
        <p className="text-xs text-muted-foreground">{brand}</p>
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
  const shippingTotal = cart ? cart.shipping_total : 0
  const total = cart ? cart.total : 0
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  return (
    <div className="bg-muted/50 rounded-card p-6">
      <h2 className="text-lg font-semibold mb-4">Ваше замовлення</h2>

      {/* Items */}
      {showItems && items.length > 0 && (
        <div className="divide-y divide-border mb-4 max-h-[300px] overflow-y-auto">
          {items.map((item) => (
            <OrderItem key={item.id} item={item} />
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
        {cart?.discount_total && cart.discount_total > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Знижка</span>
            <span>-{Math.round(cart.discount_total)} ₴</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Разом</span>
          <span>{Math.round(total)} ₴</span>
        </div>
      </div>

      {/* Promo code */}
      <div className="mt-4 pt-4 border-t">
        <details className="group">
          <summary className="cursor-pointer text-sm text-primary hover:underline list-none">
            Маєте промокод?
          </summary>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Введіть код"
              className="flex-1 h-10 px-3 rounded-input border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="px-4 h-10 bg-primary text-primary-foreground text-sm font-medium rounded-button hover:bg-primary/90 transition-colors">
              Застосувати
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}
