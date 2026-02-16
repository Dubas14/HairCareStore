'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Star, Loader2 } from 'lucide-react'
import { AddToCartAnimation } from '@/components/ui/add-to-cart-animation'
import { ShimmerBadge } from '@/components/ui/shimmer-badge'
import { useCartContext } from '@/components/providers/cart-provider'
import { useWishlist, useToggleWishlist } from '@/lib/hooks/use-wishlist'
import { useAuthStore } from '@/stores/auth-store'
import type { Product } from '@/lib/constants/home-data'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
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
    } catch (error) {
      console.error('Failed to update wishlist:', error)
    }
  }

  const handleAddToCart = async () => {
    if (isAdding) return

    if (!product.variantId) {
      console.error('No variantId for product:', product.name, product)
      return
    }

    setIsAdding(true)
    try {
      await addToCart(product.variantId, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-card rounded-card p-4 shadow-soft card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-card bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-3 left-3">
            <ShimmerBadge variant="sale" size="md">
              -{product.discount}%
            </ShimmerBadge>
          </div>
        )}

        {/* New/Bestseller Badge */}
        {product.badge && !product.discount && (
          <div className="absolute top-3 left-3">
            <ShimmerBadge
              variant={product.badge.toLowerCase().includes('хіт') ? 'bestseller' : 'new'}
              size="md"
            >
              {product.badge}
            </ShimmerBadge>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          disabled={toggleWishlist.isPending}
          className="absolute top-3 right-3 p-2.5 bg-white/90 hover:bg-white rounded-full transition-all duration-300 shadow-soft focus-ring disabled:opacity-50"
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

        {/* Auth toast */}
        {showAuthToast && (
          <div className="absolute top-14 right-3 bg-card text-foreground text-xs px-3 py-2 rounded-lg shadow-lg animate-fadeInUp z-10 whitespace-nowrap">
            <Link href="/account/login" className="text-[#2A9D8F] hover:underline">
              Увійдіть
            </Link>
            {' '}щоб зберегти товар
          </div>
        )}
      </div>

      {/* Brand */}
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 font-medium">
        {product.brand}
      </p>

      {/* Name */}
      <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 min-h-[3rem] leading-snug">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? 'fill-sale text-sale'
                  : 'fill-muted text-muted'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          ({product.reviewCount})
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-xl font-bold text-foreground">
          {product.price} грн
        </span>
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {product.oldPrice} грн
          </span>
        )}
      </div>

      {/* Add to Cart Button */}
      <div
        className={`transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        onClick={(e) => e.preventDefault()}
      >
        <AddToCartAnimation
          onAddToCart={handleAddToCart}
          productImage={product.imageUrl}
          variant="teal"
          size="sm"
          className="w-full"
          disabled={!product.variantId || isAdding}
        />
      </div>
    </Link>
  )
}
