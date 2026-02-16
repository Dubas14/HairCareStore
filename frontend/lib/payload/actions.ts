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
} from './client'

import type { Category, Brand, Banner, PromoBlock, Page } from './client'
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
