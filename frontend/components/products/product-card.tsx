'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/constants/home-data'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsWishlisted(!isWishlisted)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    // TODO: Add to cart logic
    console.log('Add to cart:', product.id)
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block bg-white rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Discount Badge */}
        {product.discount && (
          <div className="absolute top-2 left-2 bg-destructive text-white text-sm font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}

        {/* New Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2 bg-secondary text-white text-sm font-bold px-2 py-1 rounded">
            {product.badge}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors duration-250"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'fill-destructive text-destructive' : 'text-gray-600'
            }`}
          />
        </button>
      </div>

      {/* Brand */}
      <p className="text-xs text-muted-foreground uppercase mb-1">
        {product.brand}
      </p>

      {/* Name */}
      <h3 className="text-base font-semibold text-dark mb-2 line-clamp-2 min-h-[3rem]">
        {product.name}
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < Math.floor(product.rating)
                  ? 'fill-gold text-gold'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">
          ({product.reviewCount})
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-xl font-bold text-gold">
          {product.price} грн
        </span>
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {product.oldPrice} грн
          </span>
        )}
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        className={`w-full bg-gold hover:bg-gold/90 text-white transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Додати в кошик
      </Button>
    </Link>
  )
}
