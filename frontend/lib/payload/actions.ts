'use server'

/**
 * Server Actions for Payload CMS data fetching
 * Used by 'use client' components that need to call Payload Local API
 */

import {
  getCategoryBySlug as _getCategoryBySlug,
  getCategories as _getCategories,
  getBrandBySlug as _getBrandBySlug,
  getBrands as _getBrands,
  getBanners as _getBanners,
  getPromoBlocks as _getPromoBlocks,
  getPageBySlug as _getPageBySlug,
  getPages as _getPages,
  getProducts as _getProducts,
  getProductByHandle as _getProductByHandle,
  searchProducts as _searchProducts,
  getProductsByCategory as _getProductsByCategory,
  getProductsByBrand as _getProductsByBrand,
  getReviewsByProduct as _getReviewsByProduct,
  getProductRating as _getProductRating,
  getBlogPosts as _getBlogPosts,
  getBlogPostBySlug as _getBlogPostBySlug,
  getSiteSettings as _getSiteSettings,
} from './client'

import type { SiteSettingsData } from './client'

import type { Category, Brand, Banner, PromoBlock, Page, Review, BlogPost } from './client'
import type { PayloadProduct } from './types'

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return _getCategoryBySlug(slug)
}

export async function getCategories(): Promise<Category[]> {
  return _getCategories()
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  return _getBrandBySlug(slug)
}

export async function getBrands(): Promise<Brand[]> {
  return _getBrands()
}

export async function getBanners(position?: Banner['position']): Promise<Banner[]> {
  return _getBanners(position)
}

export async function getPromoBlocks(): Promise<PromoBlock[]> {
  return _getPromoBlocks()
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  return _getPageBySlug(slug)
}

export async function getPages(): Promise<Page[]> {
  return _getPages()
}

export async function getProducts(options?: {
  limit?: number; offset?: number; categoryId?: number | string; brandId?: number | string
}): Promise<{ products: PayloadProduct[]; count: number }> {
  return _getProducts(options)
}

export async function getProductByHandle(handle: string): Promise<PayloadProduct | null> {
  return _getProductByHandle(handle)
}

export async function searchProducts(query: string): Promise<{ products: PayloadProduct[]; count: number }> {
  return _searchProducts(query)
}

export async function getProductsByCategory(categorySlug: string): Promise<{ products: PayloadProduct[]; count: number }> {
  return _getProductsByCategory(categorySlug)
}

export async function getProductsByBrand(brandSlug: string): Promise<{ products: PayloadProduct[]; count: number }> {
  return _getProductsByBrand(brandSlug)
}

export async function getReviewsByProduct(productId: number | string): Promise<Review[]> {
  return _getReviewsByProduct(productId)
}

export async function getProductRating(productId: number | string): Promise<{ average: number; count: number }> {
  return _getProductRating(productId)
}

export async function getBlogPosts(options?: { limit?: number; offset?: number }): Promise<{ posts: BlogPost[]; count: number }> {
  return _getBlogPosts(options)
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return _getBlogPostBySlug(slug)
}

export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  return _getSiteSettings()
}

export async function submitReview(data: {
  customerName: string
  rating: number
  text: string
  productId: number | string
}): Promise<{ success: boolean; error?: string }> {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default

  const name = data.customerName.trim()
  const text = data.text.trim()

  if (!name || name.length < 2) return { success: false, error: 'Вкажіть ваше імʼя' }
  if (!text || text.length < 10) return { success: false, error: 'Відгук має містити щонайменше 10 символів' }
  if (data.rating < 1 || data.rating > 5) return { success: false, error: 'Оцінка має бути від 1 до 5' }

  try {
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'reviews',
      data: {
        customerName: name,
        rating: data.rating,
        text,
        product: data.productId,
        isApproved: false,
        publishedAt: new Date().toISOString(),
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'Помилка при відправці відгуку' }
  }
}
