import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'
const locales = ['uk', 'en', 'pl', 'de', 'ru'] as const

function localizedUrl(path: string, locale: string): string {
  const prefix = locale === 'uk' ? '' : `/${locale}`
  return `${BASE_URL}${prefix}${path}`
}

function alternates(path: string): Record<string, string> {
  const langs: Record<string, string> = {}
  for (const l of locales) {
    langs[l] = localizedUrl(path, l)
  }
  langs['x-default'] = localizedUrl(path, 'uk')
  return langs
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  const staticPages = [
    { path: '/', freq: 'daily' as const, priority: 1.0 },
    { path: '/shop', freq: 'daily' as const, priority: 0.9 },
    { path: '/brands', freq: 'weekly' as const, priority: 0.7 },
    { path: '/blog', freq: 'weekly' as const, priority: 0.6 },
    { path: '/compare', freq: 'weekly' as const, priority: 0.3 },
    { path: '/tracking', freq: 'weekly' as const, priority: 0.3 },
  ]

  for (const page of staticPages) {
    entries.push({
      url: localizedUrl(page.path, 'uk'),
      lastModified: new Date(),
      changeFrequency: page.freq,
      priority: page.priority,
      alternates: { languages: alternates(page.path) },
    })
  }

  try {
    const payload = await getPayload({ config })

    // Products
    try {
      const products = await payload.find({
        collection: 'products',
        limit: 5000,
        where: { status: { equals: 'active' } },
        depth: 0,
      })
      for (const product of products.docs) {
        if (product.handle) {
          const path = `/products/${product.handle}`
          entries.push({
            url: localizedUrl(path, 'uk'),
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: { languages: alternates(path) },
          })
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching products:', error)
    }

    // Categories
    try {
      const categories = await payload.find({
        collection: 'categories',
        limit: 200,
        where: { isActive: { equals: true } },
        depth: 0,
      })
      for (const category of categories.docs) {
        if (category.slug) {
          const path = `/categories/${category.slug}`
          entries.push({
            url: localizedUrl(path, 'uk'),
            lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
            alternates: { languages: alternates(path) },
          })
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching categories:', error)
    }

    // Brands
    try {
      const brands = await payload.find({
        collection: 'brands',
        limit: 200,
        where: { isActive: { equals: true } },
        depth: 0,
      })
      for (const brand of brands.docs) {
        if (brand.slug) {
          const path = `/brands/${brand.slug}`
          entries.push({
            url: localizedUrl(path, 'uk'),
            lastModified: brand.updatedAt ? new Date(brand.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
            alternates: { languages: alternates(path) },
          })
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching brands:', error)
    }

    // Blog posts
    try {
      const blogPosts = await payload.find({
        collection: 'blog-posts',
        limit: 500,
        where: { status: { equals: 'published' } },
        depth: 0,
      })
      for (const post of blogPosts.docs) {
        if (post.slug) {
          const path = `/blog/${post.slug}`
          entries.push({
            url: localizedUrl(path, 'uk'),
            lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
            alternates: { languages: alternates(path) },
          })
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching blog posts:', error)
    }

    // CMS pages
    try {
      const pages = await payload.find({
        collection: 'pages',
        limit: 100,
        where: { isPublished: { equals: true } },
        depth: 0,
      })
      for (const page of pages.docs) {
        if (page.slug) {
          const path = `/pages/${page.slug}`
          entries.push({
            url: localizedUrl(path, 'uk'),
            lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
            alternates: { languages: alternates(path) },
          })
        }
      }
    } catch (error) {
      console.error('Sitemap: Error fetching pages:', error)
    }
  } catch (error) {
    console.error('Sitemap: Error initializing Payload:', error)
  }

  return entries
}
