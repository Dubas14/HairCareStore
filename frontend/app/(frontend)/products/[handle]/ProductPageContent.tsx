'use client'

import { useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ProductGallery } from '@/components/products/product-gallery'
import { BuyBox } from '@/components/products/buy-box'
import { IngredientSpotlight } from '@/components/products/ingredient-spotlight'
import { HowToUse } from '@/components/products/how-to-use'
import { RelatedProducts } from '@/components/products/related-products'
import { ProductReviews } from '@/components/products/product-reviews'
import { useProduct, useProducts, useReviewsByProduct, useProductRating } from '@/lib/hooks/use-products'
import { useToggleWishlist } from '@/lib/hooks/use-wishlist'
import { useAuthStore } from '@/stores/auth-store'
import { getImageUrl, transformProducts } from '@/lib/payload/types'
import { useCartContext } from '@/components/providers/cart-provider'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { trackViewItem, trackAddToCart } from '@/lib/analytics/events'

// Mock ingredients data
const mockIngredients = [
  { id: '1', name: 'Кератин', benefit: 'Відновлює структуру волосся', icon: 'sparkles' as const },
  { id: '2', name: 'Гіалуронова кислота', benefit: 'Глибоке зволоження', icon: 'droplets' as const },
  { id: '3', name: 'Аргінін', benefit: 'Зміцнює волосяну цибулину', icon: 'shield' as const },
  { id: '4', name: 'Олія аргани', benefit: 'Живить та надає блиску', icon: 'leaf' as const },
]

export default function ProductPageContent() {
  const params = useParams()
  const handle = params.handle as string

  // Fetch product from Payload CMS
  const { data: product, isLoading, error } = useProduct(handle)

  // Fetch all products for related section
  const { data: allProductsData } = useProducts({ limit: 20 })

  // Fetch reviews and rating from Payload CMS
  const { data: reviews } = useReviewsByProduct(product?.id || '')
  const { data: ratingData } = useProductRating(product?.id || '')

  // Cart context
  const { addToCart } = useCartContext()

  // Wishlist
  const { isAuthenticated } = useAuthStore()
  const toggleWishlist = useToggleWishlist()

  // Convert Payload variants to frontend format
  const variants = useMemo(() => {
    if (!product?.variants) return []
    return product.variants.map((variant, index) => {
      const price = variant.price || 0
      const compareAtPrice = variant.compareAtPrice
      const oldPrice =
        compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined

      return {
        id: variant.id || `variant-${index}`,
        name: variant.title || 'Стандартний',
        price,
        oldPrice,
        inStock: variant.inStock !== false,
      }
    })
  }, [product?.variants])

  // Get product images
  const images = useMemo(() => {
    if (!product) return []
    const imgs: string[] = []
    const thumbUrl = getImageUrl(product.thumbnail)
    if (thumbUrl) imgs.push(thumbUrl)
    if (product.images) {
      for (const entry of product.images) {
        const url = getImageUrl(entry.image)
        if (url) imgs.push(url)
      }
    }
    return imgs.length > 0 ? imgs : ['/placeholder-product.jpg']
  }, [product])

  // Get related products (excluding current)
  const relatedProducts = useMemo(() => {
    if (!allProductsData?.products || !product) return []
    const otherProducts = allProductsData.products.filter(
      (p) => String(p.id) !== String(product.id)
    )
    return transformProducts(otherProducts.slice(0, 4))
  }, [allProductsData?.products, product])

  // Track product view
  useEffect(() => {
    if (product) {
      const price = product.variants?.[0]?.price || 0
      const brandName = product.subtitle || (typeof product.brand === 'object' && product.brand ? product.brand.name : 'HAIR LAB')
      trackViewItem({
        item_id: String(product.id),
        item_name: product.title,
        item_brand: brandName,
        price,
      })
    }
  }, [product])

  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </main>
    )
  }

  // Error or not found
  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Товар не знайдено</h1>
          <p className="text-muted-foreground">Спробуйте пошукати інший товар</p>
        </div>
      </main>
    )
  }

  const brand = product.subtitle
    || (typeof product.brand === 'object' && product.brand ? product.brand.name : null)
    || 'HAIR LAB'
  const productName = product.title

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      const variantIndex = variants.findIndex(v => v.id === variantId)
      const selectedVariant = variants[variantIndex >= 0 ? variantIndex : 0]
      await addToCart(product.id, variantIndex >= 0 ? variantIndex : 0, quantity)
      trackAddToCart({
        item_id: String(product.id),
        item_name: product.title,
        item_brand: brand,
        price: selectedVariant?.price || 0,
        quantity,
      })
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      alert('Увійдіть, щоб зберегти товар')
      return
    }

    try {
      await toggleWishlist.mutateAsync(product.id)
    } catch (error) {
      console.error('Error updating wishlist:', error)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <ScrollReveal variant="fade" duration={400}>
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: 'Каталог', href: '/shop' },
              { label: brand, href: `/shop?brand=${brand.toLowerCase().replace(/\s+/g, '-')}` },
              { label: productName },
            ]}
          />
        </div>
      </ScrollReveal>

      {/* Product Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ScrollReveal variant="fade-right" duration={600}>
            <ProductGallery
              images={images}
              productName={productName}
            />
          </ScrollReveal>

          {/* Buy Box - Sticky on desktop */}
          <ScrollReveal variant="fade-left" delay={150} duration={600}>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <BuyBox
                productName={productName}
                brand={brand}
                rating={ratingData?.average || 0}
                reviewCount={ratingData?.count || 0}
                variants={variants}
                badges={['Без сульфатів', 'Без парабенів', 'Vegan']}
                productImage={images[0]}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Divider */}
        <hr className="my-12 border-border" />

        {/* Ingredient Spotlight */}
        <ScrollReveal variant="fade-up" duration={700}>
          <IngredientSpotlight ingredients={mockIngredients} />
        </ScrollReveal>

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* How to Use */}
        <ScrollReveal variant="fade-up" duration={700}>
          <HowToUse steps={[
            {
              id: 'wet',
              title: 'Зволожте',
              description: 'Ретельно зволожте волосся теплою водою',
              icon: 'droplets',
            },
            {
              id: 'apply',
              title: 'Нанесіть',
              description: 'Нанесіть невелику кількість засобу на долоні та рівномірно розподіліть по волоссю',
              icon: 'hand',
            },
            {
              id: 'massage',
              title: 'Масажуйте',
              description: 'Злегка помасажуйте шкіру голови протягом 2-3 хвилин',
              icon: 'sparkles',
            },
            {
              id: 'rinse',
              title: 'Змийте',
              description: 'Ретельно змийте теплою водою. За потреби повторіть',
              icon: 'shower-head',
            },
          ]} />
        </ScrollReveal>

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* Reviews */}
        <ScrollReveal variant="fade-up" duration={700}>
          <ProductReviews reviews={reviews || []} productId={product.id} />
        </ScrollReveal>

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* Related Products */}
        <ScrollReveal variant="fade-up" duration={700}>
          <RelatedProducts products={relatedProducts} />
        </ScrollReveal>
      </div>
    </main>
  )
}
