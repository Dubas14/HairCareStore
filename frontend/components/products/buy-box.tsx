'use client'

import { useState } from 'react'
import { Heart, ShoppingCart, Minus, Plus, Check, Truck, Shield, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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
  onAddToCart,
  onAddToWishlist,
}: BuyBoxProps) {
  const [selectedVariant, setSelectedVariant] = useState(variants[0])
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)))
  }

  const handleAddToCart = async () => {
    setIsAdding(true)
    await onAddToCart(selectedVariant.id, quantity)
    setIsAdding(false)
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleWishlistClick = () => {
    setIsWishlisted(!isWishlisted)
    onAddToWishlist()
  }

  const discount = selectedVariant.oldPrice
    ? Math.round(
        ((selectedVariant.oldPrice - selectedVariant.price) /
          selectedVariant.oldPrice) *
          100
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Brand */}
      <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
        {brand}
      </p>

      {/* Product name */}
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
        {productName}
      </h1>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={cn(
                "w-5 h-5",
                i < Math.floor(rating)
                  ? "fill-sale text-sale"
                  : "fill-muted text-muted"
              )}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="text-sm text-muted-foreground">
          ({reviewCount} відгуків)
        </span>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-success/10 text-success rounded-full"
            >
              <Check className="w-3 h-3" />
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Variants */}
      {variants.length > 1 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Оберіть розмір
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                disabled={!variant.inStock}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                  selectedVariant.id === variant.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  !variant.inStock && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="block">{variant.name}</span>
                <span className="text-xs text-muted-foreground">
                  {variant.price} ₴
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground">
          {selectedVariant.price} ₴
        </span>
        {selectedVariant.oldPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {selectedVariant.oldPrice} ₴
            </span>
            <span className="px-2 py-0.5 bg-sale text-sale-foreground text-sm font-semibold rounded">
              -{discount}%
            </span>
          </>
        )}
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-foreground">Кількість</label>
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Зменшити кількість"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-medium">{quantity}</span>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= 10}
            className="p-2 hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Збільшити кількість"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || !selectedVariant.inStock}
          className="flex-1 h-12 rounded-button text-base"
        >
          {isAdded ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Додано в кошик
            </>
          ) : isAdding ? (
            <>
              <span className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Додаємо...
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Додати в кошик
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleWishlistClick}
          className="h-12 w-12"
          aria-label={isWishlisted ? "Видалити з обраного" : "Додати в обране"}
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-colors",
              isWishlisted && "fill-destructive text-destructive"
            )}
          />
        </Button>
      </div>

      {/* Stock status */}
      {selectedVariant.inStock ? (
        <p className="text-sm text-success flex items-center gap-2">
          <Check className="w-4 h-4" />В наявності
        </p>
      ) : (
        <p className="text-sm text-destructive">Немає в наявності</p>
      )}

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="w-4 h-4 flex-shrink-0" />
          <span>Безкоштовна доставка від 1000 ₴</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span>Гарантія оригінальності</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RotateCcw className="w-4 h-4 flex-shrink-0" />
          <span>Повернення 14 днів</span>
        </div>
      </div>
    </div>
  )
}
