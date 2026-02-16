/**
 * Payload CMS Client for HAIR LAB (Server-only)
 * Uses Payload Local API for fast, no-network data fetching
 *
 * For client components, use:
 * - Types/utilities: import from '@/lib/payload/types'
 * - Data fetching: import from '@/lib/payload/actions' (Server Actions)
 */

import { getPayload } from 'payload'
import config from '@payload-config'

// Re-export types and utilities so server components can import from one place
export type {
  Banner,
  PromoBlock,
  Page,
  Category,
  CategoryPromoBlock,
  CategorySeo,
  Brand,
  BenefitItem,
  PayloadMedia,
} from './types'

export {
  getImageUrl,
  isVideoMedia,
} from './types'

import type {
  Banner,
  PromoBlock,
  Page,
  Category,
  Brand,
  PayloadMedia,
  PayloadProduct,
} from './types'

// ─── Transform helpers ───────────────────────────────────────────

function resolveMedia(field: unknown): PayloadMedia | undefined {
  if (!field || typeof field === 'string' || typeof field === 'number') return undefined
  return field as PayloadMedia
}

function transformBanner(doc: any): Banner {
  return {
    id: doc.id,
    title: doc.title,
    image: resolveMedia(doc.image),
    link: doc.link || undefined,
    position: doc.position,
    order: doc.order ?? 0,
    isActive: doc.isActive ?? true,
    mediaType: doc.mediaType || undefined,
  }
}

function transformPromoBlock(doc: any): PromoBlock {
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description || undefined,
    image: resolveMedia(doc.image),
    buttonText: doc.buttonText || undefined,
    buttonLink: doc.buttonLink || undefined,
    backgroundColor: doc.backgroundColor || undefined,
    isActive: doc.isActive ?? true,
  }
}

function transformPage(doc: any): Page {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    content: doc.content || undefined,
    featuredImage: resolveMedia(doc.featuredImage),
    metaTitle: doc.metaTitle || undefined,
    metaDescription: doc.metaDescription || undefined,
    isPublished: doc.isPublished ?? false,
  }
}

function transformCategory(doc: any): Category {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || undefined,
    shortDescription: doc.shortDescription || undefined,
    banner: resolveMedia(doc.banner),
    icon: resolveMedia(doc.icon),
    accentColor: doc.accentColor || undefined,
    subcategories: Array.isArray(doc.subcategories)
      ? doc.subcategories.filter((s: any) => typeof s === 'object').map(transformCategory)
      : undefined,
    parentCategory: doc.parentCategory && typeof doc.parentCategory === 'object'
      ? transformCategory(doc.parentCategory)
      : undefined,
    promoBlock: doc.promoBlock?.title ? {
      id: doc.promoBlock.id,
      title: doc.promoBlock.title,
      description: doc.promoBlock.description || undefined,
      image: resolveMedia(doc.promoBlock.image),
      link: doc.promoBlock.link || undefined,
      buttonText: doc.promoBlock.buttonText || undefined,
    } : undefined,
    seo: doc.seo?.metaTitle || doc.seo?.metaDescription ? {
      metaTitle: doc.seo.metaTitle || undefined,
      metaDescription: doc.seo.metaDescription || undefined,
      ogImage: resolveMedia(doc.seo?.ogImage),
    } : undefined,
    order: doc.order ?? 0,
    isActive: doc.isActive ?? true,
  }
}

function transformBrand(doc: any): Brand {
  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || undefined,
    shortDescription: doc.shortDescription || undefined,
    logo: resolveMedia(doc.logo),
    banner: resolveMedia(doc.banner),
    accentColor: doc.accentColor || undefined,
    history: doc.history || undefined,
    countryOfOrigin: doc.countryOfOrigin || undefined,
    foundedYear: doc.foundedYear || undefined,
    website: doc.website || undefined,
    benefits: Array.isArray(doc.benefits)
      ? doc.benefits.map((b: any) => ({
          id: b.id,
          icon: b.icon || '\u2728',
          title: b.title,
          description: b.description || undefined,
        }))
      : undefined,
    seo: doc.seo?.metaTitle || doc.seo?.metaDescription ? {
      metaTitle: doc.seo.metaTitle || undefined,
      metaDescription: doc.seo.metaDescription || undefined,
      ogImage: resolveMedia(doc.seo?.ogImage),
    } : undefined,
    order: doc.order ?? 0,
    isActive: doc.isActive ?? true,
  }
}

// ─── Data fetching functions (Server-only) ───────────────────────

export async function getBanners(position?: Banner['position']): Promise<Banner[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'banners',
      where: {
        isActive: { equals: true },
        ...(position ? { position: { equals: position } } : {}),
      },
      sort: 'order',
      limit: 100,
    })
    return result.docs.map(transformBanner)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return []
  }
}

export async function getPromoBlocks(): Promise<PromoBlock[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'promo-blocks',
      where: {
        isActive: { equals: true },
      },
      limit: 100,
    })
    return result.docs.map(transformPromoBlock)
  } catch (error) {
    console.error('Error fetching promo blocks:', error)
    return []
  }
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      where: {
        slug: { equals: slug },
        isPublished: { equals: true },
      },
      limit: 1,
    })
    return result.docs[0] ? transformPage(result.docs[0]) : null
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

export async function getPages(): Promise<Page[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      where: {
        isPublished: { equals: true },
      },
      limit: 100,
    })
    return result.docs.map(transformPage)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'categories',
      where: {
        slug: { equals: slug },
        isActive: { equals: true },
      },
      limit: 1,
      depth: 2,
    })
    return result.docs[0] ? transformCategory(result.docs[0]) : null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'categories',
      where: {
        isActive: { equals: true },
        parentCategory: { exists: false },
      },
      sort: 'order',
      limit: 100,
      depth: 1,
    })
    return result.docs.map(transformCategory)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'brands',
      where: {
        slug: { equals: slug },
        isActive: { equals: true },
      },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ? transformBrand(result.docs[0]) : null
  } catch (error) {
    console.error('Error fetching brand:', error)
    return null
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'brands',
      where: {
        isActive: { equals: true },
      },
      sort: 'order',
      limit: 100,
      depth: 1,
    })
    return result.docs.map(transformBrand)
  } catch (error) {
    console.error('Error fetching brands:', error)
    return []
  }
}

// ─── Product data fetching ──────────────────────────────────────

export async function getProducts(options: {
  limit?: number
  offset?: number
  categoryId?: number | string
  brandId?: number | string
} = {}): Promise<{ products: PayloadProduct[]; count: number }> {
  try {
    const payload = await getPayload({ config })
    const where: Record<string, any> = { status: { equals: 'active' } }
    if (options.categoryId) where.categories = { contains: options.categoryId }
    if (options.brandId) where.brand = { equals: options.brandId }
    const result = await payload.find({
      collection: 'products',
      where,
      limit: options.limit || 20,
      page: options.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
      depth: 1,
      sort: '-createdAt',
    })
    return { products: result.docs as unknown as PayloadProduct[], count: result.totalDocs }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], count: 0 }
  }
}

export async function getProductByHandle(handle: string): Promise<PayloadProduct | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: { handle: { equals: handle }, status: { equals: 'active' } },
      limit: 1,
      depth: 2,
    })
    return result.docs[0] ? (result.docs[0] as unknown as PayloadProduct) : null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function searchProducts(query: string): Promise<{ products: PayloadProduct[]; count: number }> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'active' } },
          { or: [{ title: { contains: query } }, { subtitle: { contains: query } }] },
        ],
      },
      limit: 20,
      depth: 1,
    })
    return { products: result.docs as unknown as PayloadProduct[], count: result.totalDocs }
  } catch (error) {
    console.error('Error searching products:', error)
    return { products: [], count: 0 }
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<{ products: PayloadProduct[]; count: number }> {
  try {
    const payload = await getPayload({ config })
    const catResult = await payload.find({ collection: 'categories', where: { slug: { equals: categorySlug } }, limit: 1 })
    if (!catResult.docs[0]) return { products: [], count: 0 }
    const result = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' }, categories: { contains: catResult.docs[0].id } },
      limit: 100,
      depth: 1,
    })
    return { products: result.docs as unknown as PayloadProduct[], count: result.totalDocs }
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return { products: [], count: 0 }
  }
}

export async function getProductsByBrand(brandSlug: string): Promise<{ products: PayloadProduct[]; count: number }> {
  try {
    const payload = await getPayload({ config })
    const brandResult = await payload.find({ collection: 'brands', where: { slug: { equals: brandSlug } }, limit: 1 })
    if (!brandResult.docs[0]) return { products: [], count: 0 }
    const result = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' }, brand: { equals: brandResult.docs[0].id } },
      limit: 100,
      depth: 1,
    })
    return { products: result.docs as unknown as PayloadProduct[], count: result.totalDocs }
  } catch (error) {
    console.error('Error fetching products by brand:', error)
    return { products: [], count: 0 }
  }
}
