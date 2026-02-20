'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BorderGradientButton } from '@/components/ui/border-gradient-button'
import { useCartContext } from '@/components/providers/cart-provider'
import { cn } from '@/lib/utils'

const FREE_SHIPPING_THRESHOLD = 1000 // UAH

interface CartItemCardProps {
  item: {
    id?: string
    productTitle?: string
    productThumbnail?: string
    variantTitle?: string
    quantity: number
    unitPrice: number
  }
  index: number
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemove: (index: number) => void
  isUpdating: boolean
}

function getImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return url
}

function CartItemCard({ item, index, onUpdateQuantity, onRemove, isUpdating }: CartItemCardProps) {
  const thumbnail = getImageUrl(item.productThumbnail)
  const productTitle = item.productTitle || 'Товар'
  const variantTitle = item.variantTitle || ''

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={productTitle}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">
          {productTitle}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">{variantTitle}</p>

        {/* Quantity & Price */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded">
            <button
              onClick={() => onUpdateQuantity(index, item.quantity - 1)}
              disabled={isUpdating}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Зменшити кількість"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(index, item.quantity + 1)}
              disabled={isUpdating}
              className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
              aria-label="Збільшити кількість"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">
              {Math.round(item.unitPrice * item.quantity)} ₴
            </span>
            <button
              onClick={() => onRemove(index)}
              disabled={isUpdating}
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
    <div className={cn(
      "rounded-2xl p-4",
      isFree
        ? "bg-gradient-to-r from-[#606C38]/10 to-[#606C38]/5"
        : "bg-gradient-to-r from-[#2A9D8F]/10 to-[#48CAE4]/5"
    )}>
      <div className="flex items-center justify-between text-sm mb-3">
        {isFree ? (
          <span className="text-[#606C38] font-semibold flex items-center gap-2">
            <PartyPopper className="w-5 h-5" />
            Безкоштовна доставка!
          </span>
        ) : (
          <span className="text-[#1A1A1A]">
            Ще <span className="font-bold text-[#2A9D8F]">{Math.round(remaining)} ₴</span> до
            безкоштовної доставки
          </span>
        )}
      </div>
      <div className="h-2.5 bg-white rounded-full overflow-hidden shadow-inner">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            isFree
              ? "bg-gradient-to-r from-[#606C38] to-[#8A9A5B]"
              : "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4]"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export function CartDrawer() {
  const {
    cart,
    isLoading,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getItemCount,
    getSubtotal,
  } = useCartContext()

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

  const handleUpdateQuantity = async (index: number, quantity: number) => {
    await updateQuantity(index, quantity)
  }

  const handleRemoveItem = async (index: number) => {
    await removeItem(index)
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full max-w-md flex flex-col",
          "bg-white/95 backdrop-blur-xl",
          "shadow-2xl shadow-black/20",
          "border-l border-white/20",
          "animate-in slide-in-from-right duration-300",
          "pb-[env(safe-area-inset-bottom)]"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-black/5">
          {/* Gradient accent line */}
          <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] opacity-30" />

          <h2 id="cart-title" className="text-lg font-semibold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#2A9D8F]/10 to-[#48CAE4]/10">
              <ShoppingBag className="w-5 h-5 text-[#2A9D8F]" />
            </div>
            Кошик
            {itemCount > 0 && (
              <span className="bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-md">
                {itemCount}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className={cn(
              "p-2.5 rounded-full transition-all duration-300",
              "hover:bg-black/5 hover:rotate-90",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2A9D8F]"
            )}
            aria-label="Закрити кошик"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
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
                {items.map((item, index) => (
                  <CartItemCard
                    key={item.id || index}
                    item={item}
                    index={index}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                    isUpdating={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-black/5 p-6 space-y-4 bg-gradient-to-t from-[#F5F5F7]/50 to-transparent">
              {/* Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Підсумок</span>
                  <span className="font-medium">{Math.round(subtotal)} ₴</span>
                </div>
                {cart?.discountTotal && cart.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#606C38] font-medium">Знижка</span>
                    <span className="text-[#606C38] font-medium">
                      -{Math.round(cart.discountTotal)} ₴
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Доставка</span>
                  <span className={cn(
                    "font-medium",
                    subtotal >= FREE_SHIPPING_THRESHOLD && "text-[#606C38]"
                  )}>
                    {subtotal >= FREE_SHIPPING_THRESHOLD
                      ? 'Безкоштовно'
                      : 'Розраховується'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-black/5">
                  <span className="font-semibold text-lg">Разом</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#1A1A1A] to-[#717171] bg-clip-text text-transparent">
                    {Math.round(cart?.total || subtotal)} ₴
                  </span>
                </div>
              </div>

              {/* Actions */}
              <Link href="/checkout" onClick={closeCart} className="block">
                <BorderGradientButton variant="teal" size="lg" className="w-full">
                  Оформити замовлення
                  <ArrowRight className="w-4 h-4" />
                </BorderGradientButton>
              </Link>

              <button
                onClick={closeCart}
                className={cn(
                  "w-full py-3 text-sm font-medium text-muted-foreground",
                  "hover:text-foreground transition-colors",
                  "flex items-center justify-center gap-2"
                )}
              >
                Продовжити покупки
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
