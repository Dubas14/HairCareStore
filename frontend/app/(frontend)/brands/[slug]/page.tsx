import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBrandBySlug, getBrands } from '@/lib/payload/client'
import { getImageUrl } from '@/lib/payload/types'
import { BrandPageClient } from './brand-page-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const brands = await getBrands()
  return brands.map((brand) => ({ slug: brand.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) {
    return { title: 'Бренд не знайдено | HAIR LAB' }
  }

  const title = `${brand.name} — купити в HAIR LAB`
  const description = brand.shortDescription || `Офіційна продукція ${brand.name} в інтернет-магазині HAIR LAB. Професійна косметика для волосся з доставкою по Україні.`
  const imageUrl = brand.logo ? getImageUrl(brand.logo) : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(imageUrl && { images: [{ url: imageUrl }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)

  if (!brand) {
    notFound()
  }

  // JSON-LD structured data (trusted CMS content from Payload admin)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hairlab.store'
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Brand',
    name: brand.name,
    description: brand.shortDescription || '',
    url: `${baseUrl}/brands/${slug}`,
    ...(brand.logo && { logo: getImageUrl(brand.logo) }),
    ...(brand.countryOfOrigin && { address: { '@type': 'PostalAddress', addressCountry: brand.countryOfOrigin } }),
  })

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Головна', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Бренди', item: `${baseUrl}/brands` },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `${baseUrl}/brands/${slug}` },
    ],
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />
      <BrandPageClient initialBrand={brand} />
    </>
  )
}
