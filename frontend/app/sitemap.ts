import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  // Static pages
  entries.push(
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  )

  try {
    const payload = await getPayload({ config })

    // Products
    try {
      const products = await payload.find({
        collection: 'products',
        limit: 1000,
        where: { status: { equals: 'active' } },
      })
      for (const product of products.docs) {
        if (product.handle) {
          entries.push({
            url: `${BASE_URL}/products/${product.handle}`,
            lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
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
        limit: 100,
        where: { isActive: { equals: true } },
      })
      for (const category of categories.docs) {
        if (category.slug) {
          entries.push({
            url: `${BASE_URL}/categories/${category.slug}`,
            lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
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
        limit: 100,
        where: { isActive: { equals: true } },
      })
      for (const brand of brands.docs) {
        if (brand.slug) {
          entries.push({
            url: `${BASE_URL}/brands/${brand.slug}`,
            lastModified: brand.updatedAt ? new Date(brand.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
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
        limit: 100,
        where: { status: { equals: 'published' } },
      })
      for (const post of blogPosts.docs) {
        if (post.slug) {
          entries.push({
            url: `${BASE_URL}/blog/${post.slug}`,
            lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
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
        limit: 50,
        where: { isPublished: { equals: true } },
      })
      for (const page of pages.docs) {
        if (page.slug) {
          entries.push({
            url: `${BASE_URL}/pages/${page.slug}`,
            lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
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
