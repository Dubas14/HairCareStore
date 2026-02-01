/**
 * Strapi CMS Client for HAIR LAB
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

interface StrapiResponse<T> {
  data: T
  meta?: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface StrapiMedia {
  id: number
  url: string
  alternativeText?: string
  width: number
  height: number
  mime?: string
  formats?: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
}

// Alias for backwards compatibility
type StrapiImage = StrapiMedia

/**
 * Check if media is video based on mime type
 */
export function isVideoMedia(media?: StrapiMedia): boolean {
  return media?.mime?.startsWith('video/') ?? false
}

export interface Banner {
  id: number
  documentId: string
  title: string
  image?: StrapiMedia
  link?: string
  position: 'home' | 'category' | 'promo'
  order: number
  isActive: boolean
  mediaType?: 'image' | 'video'
  videoUrl?: string
}

export interface PromoBlock {
  id: number
  documentId: string
  title: string
  description?: any // Rich text blocks
  image?: StrapiImage
  buttonText?: string
  buttonLink?: string
  backgroundColor?: string
  isActive: boolean
}

export interface Page {
  id: number
  documentId: string
  title: string
  slug: string
  content?: any // Rich text blocks
  featuredImage?: StrapiImage
  metaTitle?: string
  metaDescription?: string
  isPublished: boolean
}

/**
 * Get full image URL from Strapi
 */
export function getStrapiImageUrl(image?: StrapiImage): string | null {
  if (!image?.url) return null
  // If URL is absolute, return as is; otherwise prepend Strapi URL
  return image.url.startsWith('http') ? image.url : `${STRAPI_URL}${image.url}`
}

/**
 * Fetch data from Strapi API
 */
async function fetchStrapi<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<StrapiResponse<T>> {
  const url = new URL(`/api${endpoint}`, STRAPI_URL)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 60 }, // Cache for 60 seconds
  })

  if (!res.ok) {
    throw new Error(`Strapi API error: ${res.status}`)
  }

  return res.json()
}

/**
 * Get all banners for a specific position
 */
export async function getBanners(position?: Banner['position']): Promise<Banner[]> {
  try {
    const params: Record<string, string> = {
      'populate': '*',
      'filters[isActive][$eq]': 'true',
      'sort': 'order:asc',
    }

    if (position) {
      params['filters[position][$eq]'] = position
    }

    const response = await fetchStrapi<Banner[]>('/banners', params)
    return response.data || []
  } catch (error) {
    console.error('Error fetching banners:', error)
    return []
  }
}

/**
 * Get all active promo blocks
 */
export async function getPromoBlocks(): Promise<PromoBlock[]> {
  try {
    const response = await fetchStrapi<PromoBlock[]>('/promo-blocks', {
      'populate': '*',
      'filters[isActive][$eq]': 'true',
    })
    return response.data || []
  } catch (error) {
    console.error('Error fetching promo blocks:', error)
    return []
  }
}

/**
 * Get a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const response = await fetchStrapi<Page[]>('/pages', {
      'populate': '*',
      'filters[slug][$eq]': slug,
      'filters[isPublished][$eq]': 'true',
    })
    return response.data?.[0] || null
  } catch (error) {
    console.error('Error fetching page:', error)
    return null
  }
}

/**
 * Get all published pages
 */
export async function getPages(): Promise<Page[]> {
  try {
    const response = await fetchStrapi<Page[]>('/pages', {
      'populate': '*',
      'filters[isPublished][$eq]': 'true',
    })
    return response.data || []
  } catch (error) {
    console.error('Error fetching pages:', error)
    return []
  }
}
