'use client'

import { useCartStore, type CartItem } from '@/stores/cart-store'

const FREE_SHIPPING_THRESHOLD = 1000
const SHIPPING_COST = 80

interface OrderSummaryProps {
  showItems?: boolean
}

function OrderItem({ item }: { item: CartItem }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{item.brand}</p>
        <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
        <p className="text-xs text-muted-foreground">{item.variant}</p>
      </div>
      <div className="text-sm font-medium">
        {item.price * item.quantity} ₴
      </div>
    </div>
  )
}

export function OrderSummary({ showItems = true }: OrderSummaryProps) {
  const { items, getSubtotal } = useCartStore()
  const subtotal = getSubtotal()
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
  const shipping = isFreeShipping ? 0 : SHIPPING_COST
  const total = subtotal + shipping

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
          <span>{subtotal} ₴</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Доставка</span>
          <span>{isFreeShipping ? 'Безкоштовно' : `${shipping} ₴`}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Разом</span>
          <span>{total} ₴</span>
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
