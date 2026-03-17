'use client'

import { useState } from 'react'
import { Check, Heart, Minus, Plus, RotateCcw, Shield, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddToCartAnimation } from '@/components/ui/add-to-cart-animation'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils/format-price'

interface Variant {
  id: string
  name: string
  price: number
  oldPrice?: number
  inStock: boolean
}

interface BuyBoxProps {
  productName: string
  brand: string
  rating: number
  reviewCount: number
  variants: Variant[]
  badges?: string[]
  productImage?: string
  onAddToCart: (variantId: string, quantity: number) => void
  onAddToWishlist: () => void
}

export function BuyBox({
  productName,
  brand,
  rating,
  reviewCount,
  variants,
  badges = [],
  productImage,
  onAddToCart,
  onAddToWishlist,
}: BuyBoxProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)))
  }

  const handleAddToCart = () => {
    onAddToCart(selectedVariant.id, quantity)
  }

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted)
    onAddToWishlist()
  }

  const discount = selectedVariant.oldPrice
    ? Math.round(
        ((selectedVariant.oldPrice - selectedVariant.price) / selectedVariant.oldPrice) * 100
      )
    : 0

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] md:p-7">
      <div className="inline-flex rounded-full border border-black/8 bg-[#fcfaf7] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/56">
        {brand}
      </div>

      <h1 className="mt-5 text-3xl font-semibold leading-[1] tracking-[-0.05em] text-foreground lg:text-4xl">
        {productName}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={cn(
                "h-5 w-5",
                i < Math.floor(rating) ? "fill-[#D4A373] text-[#D4A373]" : "fill-[#ece4dc] text-[#ece4dc]"
              )}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">({reviewCount} відгуків)</span>
      </div>

      {badges.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#eef7f5] px-3 py-1.5 text-xs font-medium text-[#20645b]"
            >
              <Check className="h-3.5 w-3.5" />
              {badge}
            </span>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-[1.6rem] bg-[#fbf6f0] p-5">
        <div className="flex items-end gap-3">
          <span className="text-4xl font-semibold tracking-[-0.05em] text-foreground">
            {formatPrice(selectedVariant.price)}
          </span>
          {selectedVariant.oldPrice && (
            <>
              <span className="pb-1 text-lg text-muted-foreground line-through">
                {formatPrice(selectedVariant.oldPrice)}
              </span>
              <span className="mb-1 rounded-full bg-[#1A1A1A] px-2.5 py-1 text-xs font-semibold text-white">
                -{discount}%
              </span>
            </>
          )}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {selectedVariant.inStock ? 'Є в наявності та готовий до відправки' : 'Тимчасово немає в наявності'}
        </p>
      </div>

      {variants.length > 1 && (
        <div className="mt-6 space-y-3">
          <label className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/54">
            Оберіть варіант
          </label>
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={!variant.inStock}
                className={cn(
                  "rounded-[1.2rem] border px-4 py-3 text-left transition-all",
                  selectedVariant.id === variant.id
                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                    : "border-black/8 bg-white hover:border-black/18",
                  !variant.inStock && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="block text-sm font-medium">{variant.name}</span>
                <span
                  className={cn(
                    "mt-1 block text-xs",
                    selectedVariant.id === variant.id ? "text-white/70" : "text-muted-foreground"
                  )}
                >
                  {formatPrice(variant.price)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/54">
          Кількість
        </span>
        <div className="flex items-center rounded-full border border-black/8 bg-[#fcfaf7] p-1">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="rounded-full p-2 transition-colors hover:bg-black/5 disabled:opacity-50"
            aria-label="Зменшити кількість"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 10}
            className="rounded-full p-2 transition-colors hover:bg-black/5 disabled:opacity-50"
            aria-label="Збільшити кількість"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <AddToCartAnimation
          onAddToCart={handleAddToCart}
          productImage={productImage}
          disabled={!selectedVariant?.inStock}
          variant="teal"
          size="lg"
          className="h-14 flex-1 rounded-full"
        >
          Додати в кошик
        </AddToCartAnimation>

        <Button
          variant="outline"
          size="icon"
          onClick={handleWishlistClick}
          className="h-14 w-14 rounded-full border-black/8"
          aria-label={isWishlisted ? "Видалити з обраного" : "Додати в обране"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isWishlisted && "fill-destructive text-destructive"
            )}
          />
        </Button>
      </div>

      <div className="mt-7 grid gap-3 border-t border-black/6 pt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Truck className="h-4 w-4 text-[#2A9D8F]" />
          <span>Безкоштовна доставка від 1000 ₴</span>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-[#2A9D8F]" />
          <span>Гарантія оригінальності</span>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="h-4 w-4 text-[#2A9D8F]" />
          <span>Повернення 14 днів</span>
        </div>
      </div>
    </div>
  )
}
