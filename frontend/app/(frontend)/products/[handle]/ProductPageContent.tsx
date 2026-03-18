'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowUpRight, BadgeCheck, Layers3, Package, ScanLine } from 'lucide-react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ProductGallery } from '@/components/products/product-gallery'
import { BuyBox } from '@/components/products/buy-box'
import { IngredientSpotlight } from '@/components/products/ingredient-spotlight'
import { RelatedProducts } from '@/components/products/related-products'
import { BundleSection } from '@/components/products/bundle-section'
import { ProductReviews } from '@/components/products/product-reviews'
import { RichText } from '@/components/blog/rich-text'
import { useProduct, useProducts, useReviewsByProduct, useProductRating } from '@/lib/hooks/use-products'
import { useToggleWishlist } from '@/lib/hooks/use-wishlist'
import { useAuthStore } from '@/stores/auth-store'
import {
  getImageUrl,
  richTextToPlainText,
  transformProducts,
  type Category,
  type PayloadIngredient,
} from '@/lib/payload/types'
import { useCartContext } from '@/components/providers/cart-provider'
import { trackViewItem, trackAddToCart } from '@/lib/analytics/events'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

export default function ProductPageContent() {
  const params = useParams()
  const handle = params.handle as string
  const pageRef = useRef<HTMLElement>(null)

  const { data: product, isLoading, error } = useProduct(handle)
  const { data: allProductsData } = useProducts({ limit: 20 })
  const { data: reviews } = useReviewsByProduct(product?.id || '')
  const { data: ratingData } = useProductRating(product?.id || '')

  const { addToCart } = useCartContext()
  const { isAuthenticated } = useAuthStore()
  const toggleWishlist = useToggleWishlist()

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
        sku: variant.sku || undefined,
        articleCode: variant.articleCode || undefined,
        inStock: variant.inStock !== false,
      }
    })
  }, [product?.variants])

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

  const ingredients = useMemo(() => {
    if (!product?.ingredients) return []

    return product.ingredients
      .filter((ing): ing is PayloadIngredient => typeof ing === 'object' && ing !== null)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((ing) => ({
        id: String(ing.id),
        name: ing.name,
        benefit: ing.benefit,
        icon: ing.icon || ('sparkles' as const),
      }))
  }, [product?.ingredients])

  const relatedProducts = useMemo(() => {
    if (!allProductsData?.products || !product) return []

    const otherProducts = allProductsData.products.filter(
      (item) => String(item.id) !== String(product.id),
    )

    return transformProducts(otherProducts.slice(0, 4))
  }, [allProductsData?.products, product])

  const brandData =
    product?.brand && typeof product.brand === 'object' ? product.brand : null
  const categories = useMemo(
    () =>
      (product?.categories || []).filter(
        (category): category is Category =>
          typeof category === 'object' &&
          category !== null &&
          'name' in category &&
          'slug' in category,
      ),
    [product?.categories],
  )
  const brand = product?.subtitle || brandData?.name || 'HAIR LAB'
  const productName = product?.title || ''
  const productDescription = richTextToPlainText(product?.description, 240)
  const brandSummary = brandData?.shortDescription || ''
  const tagBadges = (product?.tags || [])
    .map((item) => item.tag?.trim())
    .filter(Boolean)
    .slice(0, 4) as string[]

  const primaryVariant = variants[0]
  const buyBoxFacts = [
    categories[0]?.name ? { label: 'Категорія', value: categories[0].name } : null,
    brandData?.countryOfOrigin ? { label: 'Країна бренду', value: brandData.countryOfOrigin } : null,
    product?.barcode ? { label: 'Штрихкод', value: product.barcode } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>

  const productStats = [
    { label: 'Бренд', value: brand, icon: BadgeCheck },
    categories[0]?.name ? { label: 'Категорія', value: categories[0].name, icon: Layers3 } : null,
    brandData?.countryOfOrigin
      ? { label: 'Країна', value: brandData.countryOfOrigin, icon: Package }
      : null,
    product?.barcode ? { label: 'Штрихкод', value: product.barcode, icon: ScanLine } : null,
  ].filter(Boolean) as Array<{
    label: string
    value: string
    icon: typeof BadgeCheck
  }>

  useEffect(() => {
    if (product) {
      const price = product.variants?.[0]?.price || 0
      trackViewItem({
        item_id: String(product.id),
        item_name: product.title,
        item_brand: brand,
        price,
      })
    }
  }, [brand, product])

  useEffect(() => {
    if (!product || !pageRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 0.8, ease: 'power3.out' } })
        .from('[data-product-hero-el]', {
          y: 28,
          opacity: 0,
          stagger: 0.08,
          clearProps: 'all',
        })
        .from(
          '[data-product-panel="gallery"]',
          { x: -36, opacity: 0, clearProps: 'all' },
          '-=0.3',
        )
        .from(
          '[data-product-panel="buybox"]',
          { x: 36, opacity: 0, clearProps: 'all' },
          '-=0.65',
        )

      gsap.to('[data-product-glow="left"]', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: pageRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.to('[data-product-glow="right"]', {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: pageRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      gsap.utils.toArray<HTMLElement>('[data-product-section]').forEach((section) => {
        gsap.from(section, {
          y: 44,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'all',
          scrollTrigger: {
            trigger: section,
            start: 'top 82%',
            once: true,
          },
        })
      })
    }, pageRef)

    return () => ctx.revert()
  }, [product])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Завантаження...</p>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Товар не знайдено</h1>
          <p className="text-muted-foreground">Спробуйте пошукати інший товар</p>
        </div>
      </main>
    )
  }

  const handleAddToCart = async (variantId: string, quantity: number) => {
    try {
      const variantIndex = variants.findIndex((variant) => variant.id === variantId)
      const selectedVariant = variants[variantIndex >= 0 ? variantIndex : 0]

      await addToCart(product.id, variantIndex >= 0 ? variantIndex : 0, quantity)
      trackAddToCart({
        item_id: String(product.id),
        item_name: product.title,
        item_brand: brand,
        price: selectedVariant?.price || 0,
        quantity,
      })
    } catch (cartError) {
      console.error('Error adding to cart:', cartError)
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      alert('Увійдіть, щоб зберегти товар')
      return
    }

    try {
      await toggleWishlist.mutateAsync(product.id)
    } catch (wishlistError) {
      console.error('Error updating wishlist:', wishlistError)
    }
  }

  return (
    <main
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbf7f2_0%,#f6efe5_18%,#ffffff_58%,#ffffff_100%)]"
    >
      <div
        data-product-glow="left"
        className="pointer-events-none absolute left-[-10rem] top-24 h-80 w-80 rounded-full bg-[#d8eee9] blur-3xl"
      />
      <div
        data-product-glow="right"
        className="pointer-events-none absolute right-[-8rem] top-40 h-72 w-72 rounded-full bg-[#efe0cc] blur-3xl"
      />

      <div className="container mx-auto px-4 py-4" data-product-hero-el>
        <Breadcrumb
          items={[
            { label: 'Каталог', href: '/shop' },
            categories[0]
              ? { label: categories[0].name, href: `/categories/${categories[0].slug}` }
              : { label: brand },
            { label: productName },
          ]}
        />
      </div>

      <section className="container relative mx-auto px-4 pb-8 pt-4 md:pb-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-12">
          <div className="space-y-6">
            <div className="max-w-3xl space-y-5">
              <div className="flex flex-wrap gap-2" data-product-hero-el>
                <span className="inline-flex items-center rounded-full border border-black/8 bg-white/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-foreground/58 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
                  {brand}
                </span>
                {categories.slice(0, 2).map((category) => (
                  <Link
                    key={String(category.id)}
                    href={`/categories/${category.slug}`}
                    className="inline-flex items-center rounded-full border border-black/8 bg-[#fcfaf7] px-4 py-2 text-xs font-medium text-foreground/72 transition-colors hover:bg-white"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <div data-product-hero-el>
                <h1 className="text-4xl font-semibold leading-[0.94] tracking-[-0.06em] text-foreground md:text-5xl xl:text-6xl">
                  {productName}
                </h1>
                {(productDescription || brandSummary) && (
                  <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                    {productDescription || brandSummary}
                  </p>
                )}
              </div>

              {productStats.length > 0 && (
                <div
                  data-product-hero-el
                  className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                >
                  {productStats.map((stat) => {
                    const Icon = stat.icon

                    return (
                      <div
                        key={`${stat.label}-${stat.value}`}
                        className="rounded-[1.5rem] border border-black/8 bg-white/92 px-4 py-4 shadow-[0_18px_40px_rgba(16,24,40,0.06)]"
                      >
                        <div className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/42">
                          <Icon className="h-3.5 w-3.5 text-[#2A9D8F]" />
                          {stat.label}
                        </div>
                        <p className="mt-2 text-sm font-medium text-foreground">{stat.value}</p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div data-product-panel="gallery">
              <ProductGallery images={images} productName={productName} />
            </div>
          </div>

          <div data-product-panel="buybox" className="lg:sticky lg:top-24 lg:self-start">
            <BuyBox
              productName={productName}
              brand={brand}
              rating={ratingData?.average || 0}
              reviewCount={ratingData?.count || 0}
              variants={variants}
              badges={tagBadges}
              facts={buyBoxFacts}
              productImage={images[0]}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
            />
          </div>
        </div>
      </section>

      {product.description && (
        <section
          data-product-section
          className="container mx-auto px-4 pb-6 md:pb-8"
        >
          <div className="grid gap-6 rounded-[2rem] border border-black/8 bg-white/94 p-6 shadow-[0_24px_70px_rgba(16,24,40,0.07)] md:grid-cols-[220px_minmax(0,1fr)] md:p-8">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground/42">
                Опис
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Інформація про товар
              </h2>
            </div>
            <RichText content={product.description} />
          </div>
        </section>
      )}

      {(brandSummary || brandData?.website || brandData?.foundedYear) && (
        <section
          data-product-section
          className="container mx-auto px-4 pb-6 md:pb-8"
        >
          <div className="grid gap-6 rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.86))] p-6 shadow-[0_24px_70px_rgba(16,24,40,0.07)] md:grid-cols-[minmax(0,1fr)_minmax(260px,0.34fr)] md:p-8">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-foreground/42">
                Бренд
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                {brandData?.name || brand}
              </h2>
              {brandSummary ? (
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                  {brandSummary}
                </p>
              ) : null}
            </div>

            <div className="grid gap-3">
              {brandData?.countryOfOrigin ? (
                <div className="rounded-[1.4rem] border border-black/8 bg-white/88 px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/42">
                    Країна
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {brandData.countryOfOrigin}
                  </p>
                </div>
              ) : null}

              {brandData?.foundedYear ? (
                <div className="rounded-[1.4rem] border border-black/8 bg-white/88 px-4 py-4">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-foreground/42">
                    Рік заснування
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {brandData.foundedYear}
                  </p>
                </div>
              ) : null}

              {brandData?.website ? (
                <a
                  href={brandData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between rounded-[1.4rem] border border-black/8 bg-white/88 px-4 py-4 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
                >
                  Офіційний сайт бренду
                  <ArrowUpRight className="h-4 w-4 text-[#2A9D8F]" />
                </a>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {ingredients.length > 0 && (
        <section data-product-section className="container mx-auto px-4 pb-2">
          <IngredientSpotlight ingredients={ingredients} className="py-0" />
        </section>
      )}

      <section data-product-section className="container mx-auto px-4 pb-2">
        <BundleSection productId={product.id} />
      </section>

      <section data-product-section className="container mx-auto px-4 pb-2">
        <ProductReviews reviews={reviews || []} productId={product.id} />
      </section>

      {relatedProducts.length > 0 && (
        <section data-product-section className="container mx-auto px-4 pb-12 md:pb-16">
          <RelatedProducts products={relatedProducts} />
        </section>
      )}
    </main>
  )
}
