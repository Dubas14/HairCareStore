'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Star, Loader2 } from 'lucide-react'
import { AddToCartAnimation } from '@/components/ui/add-to-cart-animation'
import { ShimmerBadge } from '@/components/ui/shimmer-badge'
import { useCartContext } from '@/components/providers/cart-provider'
import { useWishlist, useToggleWishlist } from '@/lib/hooks/use-wishlist'
import { useAuthStore } from '@/stores/auth-store'
import { CompareButton } from '@/components/compare/compare-button'
import type { Product } from '@/lib/constants/home-data'
import { trackAddToCart, trackAddToWishlist } from '@/lib/analytics/events'
import { formatPrice } from '@/lib/utils/format-price'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

import { memo } from 'react'

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showAuthToast, setShowAuthToast] = useState(false)

  const { addToCart } = useCartContext()
  const { isAuthenticated } = useAuthStore()
  const { isInWishlist } = useWishlist()
  const toggleWishlist = useToggleWishlist()

  const wishlistProductId = product.productId
  const isWishlisted = wishlistProductId ? isInWishlist(wishlistProductId) : false

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      setShowAuthToast(true)
      setTimeout(() => setShowAuthToast(false), 3000)
      return
    }

    if (!wishlistProductId) {
      console.error('Cannot add to wishlist: missing productId for product', product)
      return
    }

    try {
      await toggleWishlist.mutateAsync(wishlistProductId)
      if (!isWishlisted) {
        trackAddToWishlist({
          item_id: String(product.productId),
          item_name: product.name,
          item_brand: product.brand,
          price: product.price,
        })
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error)
    }
  }

  const handleAddToCart = async () => {
    if (isAdding) return

    if (!product.productId) {
      console.error('No productId for product:', product.name, product)
      return
    }

    setIsAdding(true)
    try {
      await addToCart(product.productId, product.variantIndex ?? 0, 1)
      trackAddToCart({
        item_id: String(product.productId),
        item_name: product.name,
        item_brand: product.brand,
        price: product.price,
        quantity: 1,
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block rounded-[1.75rem] border border-black/5 bg-[#fbf8f4] p-4 shadow-[0_16px_40px_rgba(20,20,20,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(20,20,20,0.1)]"
      data-testid="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,235,229,0.92))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_transparent_38%)]" />
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={600}
          height={600}
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute left-3 top-3">
            <ShimmerBadge variant="sale" size="md">
              -{product.discount}%
            </ShimmerBadge>
          </div>
        )}

        {/* New/Bestseller Badge */}
        {product.badge && !product.discount && (
          <div className="absolute left-3 top-3">
            <ShimmerBadge
              variant={product.badge.toLowerCase().includes('хіт') ? 'bestseller' : 'new'}
              size="md"
            >
              {product.badge}
            </ShimmerBadge>
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-full bg-white/85 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b6b6b] backdrop-blur-md">
          {product.brand}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            onClick={handleWishlistClick}
            disabled={toggleWishlist.isPending}
            className="rounded-full bg-white/92 p-3 shadow-soft transition-all duration-300 hover:bg-white focus-ring disabled:opacity-50"
            data-testid="wishlist-button"
            aria-label={isWishlisted ? 'Видалити з обраного' : 'Додати в обране'}
          >
            {toggleWishlist.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin text-secondary" />
            ) : (
              <Heart
                className={`w-5 h-5 transition-colors duration-300 ${
                  isWishlisted ? 'fill-destructive text-destructive' : 'text-secondary'
                }`}
              />
            )}
          </button>
          <CompareButton
            product={product}
            className="shadow-soft"
          />
        </div>

        {/* Auth toast */}
        {showAuthToast && (
          <div className="absolute right-3 top-14 z-10 whitespace-nowrap rounded-xl bg-card px-3 py-2 text-xs text-foreground shadow-lg animate-fadeInUp">
            <Link href="/account/login" className="text-[#2A9D8F] hover:underline">
              Увійдіть
            </Link>
            {' '}щоб зберегти товар
          </div>
        )}
      </div>

      {/* Brand */}
      {/* Name */}
      <h3 className="mb-3 min-h-[3.25rem] text-[1.05rem] font-semibold leading-snug text-foreground line-clamp-2">
        {product.name}
      </h3>

      <div className="mb-4 flex items-center justify-between gap-3">
        {product.reviewCount > 0 ? (
          <>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 shadow-soft">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-sale text-sale'
                        : 'fill-muted text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {product.reviewCount} відгуків
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Будьте першим — залиште відгук</span>
        )}
      </div>

      {/* Price */}
      <div className="mb-4 rounded-[1.2rem] bg-white px-4 py-3 shadow-soft">
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {product.discount ? (
            <span className="rounded-full bg-[#2A9D8F]/10 px-3 py-1 text-xs font-medium text-[#1e7b70]">
              вигідна ціна
            </span>
          ) : null}
        </div>
      </div>

      {/* Add to Cart Button */}
      <div
        className={cn(
          'transition-all duration-300 opacity-100 translate-y-0',
          isHovered ? 'sm:opacity-100 sm:translate-y-0' : 'sm:opacity-0 sm:translate-y-2'
        )}
        onClick={(e) => e.preventDefault()}
      >
        <AddToCartAnimation
          onAddToCart={handleAddToCart}
          productImage={product.imageUrl}
          variant="teal"
          size="sm"
          className="w-full"
          disabled={!product.productId || isAdding}
        />
      </div>
    </Link>
  )
})
