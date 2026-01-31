'use client'

import { useParams } from 'next/navigation'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ProductGallery } from '@/components/products/product-gallery'
import { BuyBox } from '@/components/products/buy-box'
import { IngredientSpotlight } from '@/components/products/ingredient-spotlight'
import { HowToUse } from '@/components/products/how-to-use'
import { RelatedProducts } from '@/components/products/related-products'
import { featuredProducts, type Product } from '@/lib/constants/home-data'

// Combine all products
const allProducts: Product[] = [
  ...featuredProducts.bestsellers,
  ...featuredProducts.new,
  ...featuredProducts.sale,
]

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

  // Find product by slug
  const product = allProducts.find((p) => p.slug === handle)

  // For demo purposes, show first product if not found
  const displayProduct = product || allProducts[0]

  if (!displayProduct) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Товар не знайдено</h1>
          <p className="text-muted-foreground">Спробуйте пошукати інший товар</p>
        </div>
      </main>
    )
  }

  // Create variants from product data
  const variants = [
    {
      id: '100ml',
      name: '100 мл',
      price: Math.round(displayProduct.price * 0.5),
      inStock: true,
    },
    {
      id: '250ml',
      name: '250 мл',
      price: displayProduct.price,
      oldPrice: displayProduct.oldPrice,
      inStock: true,
    },
    {
      id: '500ml',
      name: '500 мл',
      price: Math.round(displayProduct.price * 1.7),
      inStock: true,
    },
  ]

  // Get related products (same brand or random)
  const relatedProducts = allProducts
    .filter((p) => p.id !== displayProduct.id)
    .slice(0, 4)

  const handleAddToCart = async (variantId: string, quantity: number) => {
    // TODO: Integrate with Medusa cart API
    console.log('Add to cart:', { variantId, quantity, product: displayProduct.id })
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  const handleAddToWishlist = () => {
    // TODO: Integrate with wishlist store
    console.log('Add to wishlist:', displayProduct.id)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: 'Каталог', href: '/shop' },
            { label: displayProduct.brand, href: `/shop?brand=${displayProduct.brand.toLowerCase()}` },
            { label: displayProduct.name },
          ]}
        />
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery
            images={[
              displayProduct.imageUrl,
              displayProduct.imageUrl,
              displayProduct.imageUrl,
            ]}
            productName={displayProduct.name}
          />

          {/* Buy Box - Sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <BuyBox
              productName={displayProduct.name}
              brand={displayProduct.brand}
              rating={displayProduct.rating}
              reviewCount={displayProduct.reviewCount}
              variants={variants}
              badges={['Без сульфатів', 'Без парабенів', 'Vegan']}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        </div>

        {/* Divider */}
        <hr className="my-12 border-border" />

        {/* Ingredient Spotlight */}
        <IngredientSpotlight ingredients={mockIngredients} />

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* How to Use */}
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

        {/* Divider */}
        <hr className="my-8 border-border" />

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </main>
  )
}
