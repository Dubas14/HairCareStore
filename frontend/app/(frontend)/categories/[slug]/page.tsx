import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, getCategories } from '@/lib/payload/client'
import { getImageUrl } from '@/lib/payload/types'
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

  // JSON-LD for category (trusted CMS data)
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <CategoryPageClient initialCategory={category} slug={slug} />
    </>
  )
}
