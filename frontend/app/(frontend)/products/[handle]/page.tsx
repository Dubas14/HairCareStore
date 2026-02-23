export const revalidate = 300 // ISR: revalidate every 5 minutes

import type { Metadata } from 'next'
import { getProductByHandle, getProductRating, getProducts, getReviewsByProduct } from '@/lib/payload/client'
import { getImageUrl } from '@/lib/payload/types'
import type { Review } from '@/lib/payload/types'
import ProductPageContent from './ProductPageContent'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'

interface Props {
  params: Promise<{ handle: string }>
}

export async function generateStaticParams() {
  const { products } = await getProducts({ limit: 100 })
  return products.map((p) => ({ handle: p.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  if (!product) {
    return { title: 'Товар не знайдено | HAIR LAB' }
  }

  const brand = product.subtitle
    || (typeof product.brand === 'object' && product.brand ? product.brand.name : null)
    || 'HAIR LAB'
  const title = `${product.title} — ${brand} | HAIR LAB`
  const description = typeof product.description === 'string'
    ? product.description.slice(0, 160)
    : `${product.title} від ${brand}. Професійна косметика для волосся в інтернет-магазині HAIR LAB.`
  const imageUrl = getImageUrl(product.thumbnail)
  const url = `${BASE_URL}/products/${handle}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'HAIR LAB',
      ...(imageUrl && {
        images: [{ url: imageUrl, width: 600, height: 600, alt: product.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  }
}

function buildProductJsonLd(
  product: NonNullable<Awaited<ReturnType<typeof getProductByHandle>>>,
  brand: string,
  url: string,
  imageUrl: string | null,
  ratingAverage?: number,
  ratingCount?: number,
  reviews?: Review[],
) {
  const variants = product.variants || []
  const firstVariant = variants[0]
  const anyInStock = variants.some((v) => v.inStock !== false)

  // Build offers: AggregateOffer for multi-variant, Offer for single
  const prices = variants.map((v) => v.price).filter((p) => p > 0)
  const lowPrice = prices.length > 0 ? Math.min(...prices) : 0
  const highPrice = prices.length > 0 ? Math.max(...prices) : 0

  let offers: Record<string, unknown>
  if (variants.length > 1 && lowPrice !== highPrice) {
    offers = {
      '@type': 'AggregateOffer',
      url,
      priceCurrency: 'UAH',
      lowPrice: lowPrice.toFixed(2),
      highPrice: highPrice.toFixed(2),
      offerCount: variants.length,
      availability: anyInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'HAIR LAB' },
    }
  } else {
    const price = firstVariant?.price || 0
    const compareAtPrice = firstVariant?.compareAtPrice
    offers = {
      '@type': 'Offer',
      url,
      priceCurrency: 'UAH',
      price: price.toFixed(2),
      ...(compareAtPrice && compareAtPrice > price && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
      availability: anyInStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'HAIR LAB' },
    }
  }

  // Build review array for JSON-LD
  const reviewSchemas = reviews && reviews.length > 0
    ? reviews.slice(0, 10).map((r) => ({
        '@type': 'Review' as const,
        author: { '@type': 'Person' as const, name: r.customerName },
        reviewRating: {
          '@type': 'Rating' as const,
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.text,
        ...(r.publishedAt && { datePublished: r.publishedAt.split('T')[0] }),
      }))
    : undefined

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: typeof product.description === 'string'
      ? product.description.slice(0, 500)
      : `${product.title} від ${brand}`,
    ...(imageUrl && { image: imageUrl }),
    brand: { '@type': 'Brand', name: brand },
    sku: firstVariant?.sku || product.handle,
    ...(ratingCount && ratingCount > 0 && ratingAverage && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingAverage.toFixed(1),
        reviewCount: ratingCount,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(reviewSchemas && { review: reviewSchemas }),
    offers,
  })
}

function buildBreadcrumbJsonLd(product: NonNullable<Awaited<ReturnType<typeof getProductByHandle>>>, brand: string) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${BASE_URL}/shop` },
      { '@type': 'ListItem', position: 3, name: brand, item: `${BASE_URL}/shop?brand=${encodeURIComponent(brand.toLowerCase().replace(/\s+/g, '-'))}` },
      { '@type': 'ListItem', position: 4, name: product.title },
    ],
  })
}

export default async function ProductPage({ params }: Props) {
  const { handle } = await params
  const product = await getProductByHandle(handle)

  const brand = product
    ? (product.subtitle
      || (typeof product.brand === 'object' && product.brand ? product.brand.name : null)
      || 'HAIR LAB')
    : ''
  const imageUrl = product ? getImageUrl(product.thumbnail) : null
  const url = `${BASE_URL}/products/${handle}`

  // Fetch rating + reviews server-side for JSON-LD
  let ratingAverage = 0
  let ratingCount = 0
  let reviews: Review[] = []
  if (product) {
    try {
      const [rating, productReviews] = await Promise.all([
        getProductRating(product.id),
        getReviewsByProduct(product.id),
      ])
      ratingAverage = rating.average
      ratingCount = rating.count
      reviews = productReviews
    } catch {
      // Rating/review data is optional, skip gracefully
    }
  }

  // JSON-LD is built from trusted server-side CMS data only (no user input)
  const productJsonLd = product ? buildProductJsonLd(product, brand, url, imageUrl, ratingAverage, ratingCount, reviews) : null
  const breadcrumbJsonLd = product ? buildBreadcrumbJsonLd(product, brand) : null

  return (
    <>
      {productJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: productJsonLd }} />
      )}
      {breadcrumbJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      )}
      <ProductPageContent />
    </>
  )
}
