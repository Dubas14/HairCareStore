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
  Review,
  BlogPost,
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
  Review,
  BlogPost,
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

function transformReview(doc: any): Review {
  return {
    id: doc.id,
    customerName: doc.customerName,
    rating: doc.rating,
    text: doc.text,
    product: doc.product,
    isApproved: doc.isApproved ?? false,
    publishedAt: doc.publishedAt || undefined,
  }
}

function transformBlogPost(doc: any): BlogPost {
  return {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    content: doc.content || undefined,
    excerpt: doc.excerpt || undefined,
    featuredImage: resolveMedia(doc.featuredImage),
    author: doc.author || undefined,
    tags: Array.isArray(doc.tags) ? doc.tags : undefined,
    publishedAt: doc.publishedAt || undefined,
    status: doc.status || 'draft',
  }
}

// ─── Data fetching functions (Server-only) ───────────────────────

export async function getBanners(position?: Banner['position'], locale?: string): Promise<Banner[]> {
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

export async function getPromoBlocks(locale?: string): Promise<PromoBlock[]> {
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

export async function getPageBySlug(slug: string, locale?: string): Promise<Page | null> {
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

export async function getPages(locale?: string): Promise<Page[]> {
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

export async function getCategoryBySlug(slug: string, locale?: string): Promise<Category | null> {
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

export async function getCategories(locale?: string): Promise<Category[]> {
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

export async function getBrandBySlug(slug: string, locale?: string): Promise<Brand | null> {
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

export async function getBrands(locale?: string): Promise<Brand[]> {
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
  locale?: string
} = {}): Promise<{
  products: PayloadProduct[]
  count: number
  totalPages: number
  currentPage: number
  hasNextPage: boolean
}> {
  try {
    const payload = await getPayload({ config })
    const andConditions: Record<string, any>[] = [{ status: { equals: 'active' } }]

    // Search by title/subtitle
    if (options.search) {
      andConditions.push({
        or: [
          { title: { like: options.search } },
          { subtitle: { like: options.search } },
        ],
      })
    }

    // Category filter (single or multiple)
    if (options.categoryIds?.length) {
      andConditions.push({ categories: { in: options.categoryIds } })
    } else if (options.categoryId) {
      andConditions.push({ categories: { contains: options.categoryId } })
    }

    // Brand filter (single or multiple)
    if (options.brandIds?.length) {
      andConditions.push({ brand: { in: options.brandIds } })
    } else if (options.brandId) {
      andConditions.push({ brand: { equals: options.brandId } })
    }

    // Price range filter (on first variant)
    if (options.minPrice !== undefined) {
      andConditions.push({ 'variants.price': { greater_than_equal: options.minPrice } })
    }
    if (options.maxPrice !== undefined) {
      andConditions.push({ 'variants.price': { less_than_equal: options.maxPrice } })
    }

    // Tags filter
    if (options.tags?.length) {
      andConditions.push({ 'tags.tag': { in: options.tags } })
    }

    const where = andConditions.length === 1 ? andConditions[0] : { and: andConditions }

    // Sort mapping
    let sort: string = '-createdAt'
    switch (options.sortBy) {
      case 'price_asc': sort = 'variants.price'; break
      case 'price_desc': sort = '-variants.price'; break
      case 'newest': sort = '-createdAt'; break
      case 'popular': sort = '-createdAt'; break // TODO: add popularity/sales field
      case 'rating': sort = '-createdAt'; break // TODO: add rating field
    }

    const limit = options.limit || 24
    const pageNum = options.page || (options.offset ? Math.floor(options.offset / limit) + 1 : 1)

    const result = await payload.find({
      collection: 'products',
      where,
      limit,
      page: pageNum,
      depth: 1,
      sort,
    })
    return {
      products: result.docs as unknown as PayloadProduct[],
      count: result.totalDocs,
      totalPages: result.totalPages,
      currentPage: result.page || 1,
      hasNextPage: result.hasNextPage,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], count: 0, totalPages: 0, currentPage: 1, hasNextPage: false }
  }
}

export async function getProductByHandle(handle: string, locale?: string): Promise<PayloadProduct | null> {
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

export async function searchProducts(query: string, locale?: string): Promise<{ products: PayloadProduct[]; count: number }> {
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

export async function getProductsByCategory(categorySlug: string, locale?: string): Promise<{ products: PayloadProduct[]; count: number }> {
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

export async function getProductsByBrand(brandSlug: string, locale?: string): Promise<{ products: PayloadProduct[]; count: number }> {
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

// ─── Review data fetching ───────────────────────────────────────

export async function getReviewsByProduct(productId: number | string): Promise<Review[]> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'reviews',
      where: {
        product: { equals: productId },
        isApproved: { equals: true },
      },
      sort: '-publishedAt',
      limit: 100,
    })
    return result.docs.map(transformReview)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return []
  }
}

export async function getProductRating(productId: number | string): Promise<{ average: number; count: number }> {
  try {
    const reviews = await getReviewsByProduct(productId)
    if (reviews.length === 0) return { average: 0, count: 0 }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length }
  } catch (error) {
    console.error('Error calculating product rating:', error)
    return { average: 0, count: 0 }
  }
}

// ─── Blog data fetching ─────────────────────────────────────────

export async function getBlogPosts(options: { limit?: number; offset?: number; locale?: string } = {}): Promise<{ posts: BlogPost[]; count: number }> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        status: { equals: 'published' },
      },
      sort: '-publishedAt',
      limit: options.limit || 20,
      page: options.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
      depth: 1,
    })
    return { posts: result.docs.map(transformBlogPost), count: result.totalDocs }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return { posts: [], count: 0 }
  }
}

export async function getBlogPostBySlug(slug: string, locale?: string): Promise<BlogPost | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
      },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ? transformBlogPost(result.docs[0]) : null
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

// ─── Site Settings (Global) ─────────────────────────────────────

export interface SiteSettingsData {
  contacts: {
    phone: string
    phoneLink: string
    phoneSchedule: string
    email: string
    emailDescription: string
    address: string
    addressLink: string
    addressDescription: string
    schedule: string
    scheduleDescription: string
  }
  social: {
    instagram: string
    telegram: string
    facebook: string
  }
  delivery: {
    methods: Array<{ title: string; description: string; isHighlight: boolean }>
    steps: Array<{ title: string; description: string }>
    faq: Array<{ question: string; answer: string }>
  }
  payment: {
    methods: Array<{ title: string; description: string; isHighlight: boolean }>
    securityText: string
    faq: Array<{ question: string; answer: string }>
  }
  about: {
    intro: string
    story: string
    features: Array<{ title: string; description: string }>
    stats: Array<{ value: string; label: string }>
  }
}

export async function getSiteSettings(locale?: string): Promise<SiteSettingsData | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.findGlobal({ slug: 'site-settings' })
    return result as unknown as SiteSettingsData
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}
