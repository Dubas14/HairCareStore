'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartContext } from '@/components/providers/cart-provider'
import type { MedusaCartItem } from '@/lib/medusa/hooks'
import { cn } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 1000 // UAH

function CartItemCard({ item }: { item: MedusaCartItem }) {
  const { updateQuantity, removeItem, isLoading } = useCartContext()

  const productName = item.variant?.product?.title || item.title
  const brand = item.variant?.product?.subtitle || 'HAIR LAB'
  const variantName = item.variant?.title || 'Стандартний'
  const imageUrl = item.thumbnail || item.variant?.product?.thumbnail || '/placeholder-product.jpg'
  const price = item.unit_price // Medusa v2 stores in major units

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        <img
          src={imageUrl}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">
          {brand}
        </p>
        <h4 className="text-sm font-medium text-foreground line-clamp-2">
          {productName}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{variantName}</p>

        {/* Quantity & Price */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={isLoading}
              className="p-1.5 hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Зменшити кількість"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={isLoading}
              className="p-1.5 hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Збільшити кількість"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {Math.round(price * item.quantity)} ₴
            </span>
            <button
              onClick={() => removeItem(item.id)}
              disabled={isLoading}
              className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              aria-label="Видалити товар"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)
  const isFree = remaining <= 0

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-center justify-between text-sm mb-2">
        {isFree ? (
          <span className="text-success font-medium">
            Вітаємо! Безкоштовна доставка!
          </span>
        ) : (
          <span>
            Ще <span className="font-semibold">{Math.round(remaining)} ₴</span> до
            безкоштовної доставки
          </span>
        )}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500",
            isFree ? "bg-success" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function CartDrawer() {
  const { cart, isCartOpen, closeCart, getItemCount, getSubtotal, isLoading } = useCartContext()
  const items = cart?.items || []
  const itemCount = getItemCount()
  const subtotal = getSubtotal()

  // Lock body scroll when open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isCartOpen, closeCart])

  if (!isCartOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 id="cart-title" className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Кошик
            {itemCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            aria-label="Закрити кошик"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Кошик порожній</h3>
            <p className="text-muted-foreground mb-6">
              Додайте товари, щоб оформити замовлення
            </p>
            <Button onClick={closeCart} asChild>
              <Link href="/shop">
                Перейти до каталогу
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 py-4 border-b">
              <FreeShippingProgress subtotal={subtotal} />
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 space-y-4">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Підсумок</span>
                  <span>{Math.round(subtotal)} ₴</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? 'Безкоштовно'
                      : 'Розраховується'}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Разом</span>
                  <span>{Math.round(subtotal)} ₴</span>
                </div>
              </div>

              {/* Actions */}
              <Button className="w-full h-12 rounded-button" asChild>
                <Link href="/checkout" onClick={closeCart}>
                  Оформити замовлення
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={closeCart}
              >
                Продовжити покупки
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
