export const revalidate = 300 // ISR: revalidate every 5 minutes

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategories, getProductsByCategory } from '@/lib/payload/client'
import { getImageUrl } from '@/lib/payload/types'
import { buildItemListJsonLd } from '@/lib/structured-data'
import { CategoryPageClient } from './category-page-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: 'Категорію не знайдено | HAIR LAB' }
  }

  const title = `${category.name} — професійна косметика | HAIR LAB`
  const descriptionText = category.shortDescription || (typeof category.description === 'string' ? category.description : null) || `Купити ${category.name.toLowerCase()} в HAIR LAB. Професійна косметика для волосся з доставкою по Україні.`
  const imageUrl = category.banner ? getImageUrl(category.banner) : undefined

  return {
    title,
    description: descriptionText,
    openGraph: {
      title,
      description: descriptionText,
      type: 'website',
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: descriptionText,
    },
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  // JSON-LD for category — all data from trusted server-side Payload CMS, no user input
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.shortDescription || (typeof category.description === 'string' ? category.description : '') || '',
    url: `${baseUrl}/categories/${slug}`,
    ...(category.banner && { image: getImageUrl(category.banner) }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Головна', item: baseUrl },
        { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${baseUrl}/shop` },
        { '@type': 'ListItem', position: 3, name: category.name, item: `${baseUrl}/categories/${slug}` },
      ],
    },
  })

  // ItemList JSON-LD with top products for rich snippets (trusted CMS data)
  let itemListJsonLd: string | null = null
  try {
    const { products } = await getProductsByCategory(slug)
    if (products.length > 0) {
      itemListJsonLd = buildItemListJsonLd(
        `${category.name} — HAIR LAB`,
        products.slice(0, 30).map((p, i) => ({
          name: p.title,
          url: `${baseUrl}/products/${p.handle}`,
          position: i + 1,
          image: getImageUrl(p.thumbnail) || undefined,
          price: p.variants?.[0]?.price,
          currency: 'UAH',
        })),
      )
    }
  } catch {
    // ItemList is optional SEO enhancement
  }

  return (
    <>
      {/* All JSON-LD built from trusted server-side CMS data only */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListJsonLd }} />
      )}
      <CategoryPageClient initialCategory={category} slug={slug} />
    </>
  )
}
