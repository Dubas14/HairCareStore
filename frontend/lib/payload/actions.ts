'use server'

/**
 * Server Actions for Payload CMS data fetching
 * Used by 'use client' components that need to call Payload Local API
 * Automatically passes current locale from next-intl to Payload queries
 */

import { getLocale } from 'next-intl/server'

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
  getFilterFacets as _getFilterFacets,
  getBlogPosts as _getBlogPosts,
  getBlogPostBySlug as _getBlogPostBySlug,
  getSiteSettings as _getSiteSettings,
  getBundlesForProduct as _getBundlesForProduct,
} from './client'

import type { Category, Brand, Banner, PromoBlock, Page, Review, BlogPost, FilterFacets, ProductBundle } from './client'
import type { PayloadProduct } from './types'
import type { SiteSettingsData } from './client'

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const locale = await getLocale()
  return _getCategoryBySlug(slug, locale)
}

export async function getCategories(): Promise<Category[]> {
  const locale = await getLocale()
  return _getCategories(locale)
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const locale = await getLocale()
  return _getBrandBySlug(slug, locale)
}

export async function getBrands(): Promise<Brand[]> {
  const locale = await getLocale()
  return _getBrands(locale)
}

export async function getBanners(position?: Banner['position']): Promise<Banner[]> {
  const locale = await getLocale()
  return _getBanners(position, locale)
}

export async function getPromoBlocks(): Promise<PromoBlock[]> {
  const locale = await getLocale()
  return _getPromoBlocks(locale)
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const locale = await getLocale()
  return _getPageBySlug(slug, locale)
}

export async function getPages(): Promise<Page[]> {
  const locale = await getLocale()
  return _getPages(locale)
}

export async function getProducts(options?: {
  limit?: number
  offset?: number
  page?: number
  categoryId?: number | string
  categoryIds?: (string | number)[]
  brandId?: number | string
  brandIds?: (string | number)[]
  search?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}): Promise<{
  products: PayloadProduct[]
  count: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
}> {
  const locale = await getLocale()
  return _getProducts({ ...options, locale })
}

export async function getProductByHandle(handle: string): Promise<PayloadProduct | null> {
  const locale = await getLocale()
  return _getProductByHandle(handle, locale)
}

export async function searchProducts(query: string): Promise<{ products: PayloadProduct[]; count: number }> {
  const locale = await getLocale()
  return _searchProducts(query, locale)
}

export async function getProductsByCategory(categorySlug: string): Promise<{ products: PayloadProduct[]; count: number }> {
  const locale = await getLocale()
  return _getProductsByCategory(categorySlug, locale)
}

export async function getProductsByBrand(brandSlug: string): Promise<{ products: PayloadProduct[]; count: number }> {
  const locale = await getLocale()
  return _getProductsByBrand(brandSlug, locale)
}

export async function getReviewsByProduct(productId: number | string): Promise<Review[]> {
  return _getReviewsByProduct(productId)
}

export async function getProductRating(productId: number | string): Promise<{ average: number; count: number }> {
  return _getProductRating(productId)
}

export async function getFilterFacets(options?: {
  categoryIds?: (string | number)[]
  brandIds?: (string | number)[]
  search?: string
}): Promise<FilterFacets> {
  const locale = await getLocale()
  return _getFilterFacets({ ...options, locale })
}

export async function getBlogPosts(options?: { limit?: number; offset?: number }): Promise<{ posts: BlogPost[]; count: number }> {
  const locale = await getLocale()
  return _getBlogPosts({ ...options, locale })
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const locale = await getLocale()
  return _getBlogPostBySlug(slug, locale)
}

export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  const locale = await getLocale()
  return _getSiteSettings(locale)
}

export async function getBundlesForProduct(productId: number | string): Promise<ProductBundle[]> {
  return _getBundlesForProduct(productId)
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
