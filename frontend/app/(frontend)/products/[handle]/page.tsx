import type { Metadata } from 'next'
import { getProductByHandle } from '@/lib/payload/client'
import { getImageUrl } from '@/lib/payload/types'
import ProductPageContent from './ProductPageContent'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'

interface Props {
  params: Promise<{ handle: string }>
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

function buildProductJsonLd(product: NonNullable<Awaited<ReturnType<typeof getProductByHandle>>>, brand: string, url: string, imageUrl: string | null) {
  const variant = product.variants?.[0]
  const price = variant?.price || 0
  const compareAtPrice = variant?.compareAtPrice
  const inStock = variant?.inStock !== false

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: typeof product.description === 'string'
      ? product.description.slice(0, 500)
      : `${product.title} від ${brand}`,
    ...(imageUrl && { image: imageUrl }),
    brand: { '@type': 'Brand', name: brand },
    sku: variant?.sku || product.handle,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'UAH',
      price: price.toFixed(2),
      ...(compareAtPrice && compareAtPrice > price && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'HAIR LAB' },
    },
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

  // JSON-LD is built from trusted server-side CMS data only (no user input)
  const productJsonLd = product ? buildProductJsonLd(product, brand, url, imageUrl) : null
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
