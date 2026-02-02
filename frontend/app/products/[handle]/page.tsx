'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ProductGallery } from '@/components/products/product-gallery'
import { BuyBox } from '@/components/products/buy-box'
import { IngredientSpotlight } from '@/components/products/ingredient-spotlight'
import { HowToUse } from '@/components/products/how-to-use'
import { RelatedProducts } from '@/components/products/related-products'
import { useProduct, useProducts } from '@/lib/medusa/hooks'
import { toFrontendProducts, getImageUrl } from '@/lib/medusa/adapters'
import { useCartContext } from '@/components/providers/cart-provider'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

// Mock ingredients data
const mockIngredients = [
  { id: '1', name: 'Кератин', benefit: 'Відновлює структуру волосся', icon: 'sparkles' as const },
  { id: '2', name: 'Гіалуронова кислота', benefit: 'Глибоке зволоження', icon: 'droplets' as const },
  { id: '3', name: 'Аргінін', benefit: 'Зміцнює волосяну цибулину', icon: 'shield' as const },
  { id: '4', name: 'Олія аргани', benefit: 'Живить та надає блиску', icon: 'leaf' as const },
]

export default function ProductPage() {
  const params = useParams()
  const handle = params.handle as string

  // Fetch product from Medusa
  const { data: medusaProduct, isLoading, error } = useProduct(handle)

  // Fetch all products for related section
  const { data: allProductsData } = useProducts({ limit: 20 })

  // Cart context (Medusa)
  const { addToCart } = useCartContext()

  // Convert Medusa variants to frontend format
  const variants = useMemo(() => {
    if (!medusaProduct?.variants) return []
    return medusaProduct.variants.map((variant) => {
      // Use calculated_price if available, otherwise fallback to prices
      // Medusa v2 stores prices in major units
      const calculatedPrice = variant.calculated_price?.calculated_amount
      const originalPrice = variant.calculated_price?.original_amount
      const price = calculatedPrice
        ? calculatedPrice
        : variant.prices?.[0]?.amount
        ? variant.prices[0].amount
        : 0

      // Show old price if there's a discount (price list, customer group, promo)
      const oldPrice =
        originalPrice && calculatedPrice && originalPrice > calculatedPrice
          ? originalPrice
          : undefined

      return {
        id: variant.id,
        name: variant.title || 'Стандартний',
        price,
        oldPrice,
        inStock: true,
      }
    })
  }, [medusaProduct?.variants])

  // Get product images
  const images = useMemo(() => {
    if (!medusaProduct) return []
    const imgs: string[] = []
    if (medusaProduct.thumbnail) imgs.push(getImageUrl(medusaProduct.thumbnail))
    if (medusaProduct.images) {
      imgs.push(...medusaProduct.images.map((img) => getImageUrl(img.url)))
    }
    return imgs.length > 0 ? imgs : ['/placeholder-product.jpg']
  }, [medusaProduct])

  // Get related products (excluding current)
  const relatedProducts = useMemo(() => {
    if (!allProductsData?.products || !medusaProduct) return []
    const otherProducts = allProductsData.products.filter(
      (p) => p.id !== medusaProduct.id
    )
    return toFrontendProducts(otherProducts.slice(0, 4))
  }, [allProductsData?.products, medusaProduct])

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
  if (error || !medusaProduct) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Товар не знайдено</h1>
          <p className="text-muted-foreground">Спробуйте пошукати інший товар</p>
        </div>
      </main>
    )
  }

  const brand = medusaProduct.subtitle || 'HAIR LAB'
  const productName = medusaProduct.title

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      await addToCart(variantId, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const handleAddToWishlist = () => {
    // TODO: Integrate with wishlist store
    console.log('Add to wishlist:', medusaProduct.id)
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
                rating={4.5}
                reviewCount={0}
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
              icon: '💧',
            },
            {
              id: 'apply',
              title: 'Нанесіть',
              description: 'Нанесіть невелику кількість засобу на долоні та рівномірно розподіліть по волоссю',
              icon: '✋',
            },
            {
              id: 'massage',
              title: 'Масажуйте',
              description: 'Злегка помасажуйте шкіру голови протягом 2-3 хвилин',
              icon: '🧘',
            },
            {
              id: 'rinse',
              title: 'Змийте',
              description: 'Ретельно змийте теплою водою. За потреби повторіть',
              icon: '🚿',
            },
          ]} />
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
