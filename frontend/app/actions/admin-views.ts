'use server'

/**
 * Server Actions for custom Payload CMS admin views — HAIR LAB
 *
 * Provides data fetching and mutation actions for:
 * - Products list view  (getProductsViewData)
 * - Media library view  (getMediaViewData)
 * - Banners view        (getBannersViewData, toggleBannerActive, deleteBanner)
 * - Mutations           (deleteProduct, deleteMediaFile)
 */

import { getPayload } from 'payload'
import config from '@payload-config'

// ─── Shared internal helpers ──────────────────────────────────────────────────

/** Resolve a URL stored on a Payload media relation (may be a bare string id after depth:0). */
function resolveMediaUrl(field: unknown): string | null {
  if (!field || typeof field === 'string' || typeof field === 'number') return null
  const media = field as Record<string, any>
  return typeof media.url === 'string' ? media.url : null
}

function resolveMediaAlt(field: unknown): string {
  if (!field || typeof field === 'string' || typeof field === 'number') return ''
  const media = field as Record<string, any>
  return typeof media.alt === 'string' ? media.alt : ''
}

// ─── Products view ────────────────────────────────────────────────────────────

export interface ProductViewItem {
  id: string | number
  title: string
  subtitle: string
  handle: string
  status: string
  thumbnail: { url: string; alt: string } | null
  categories: Array<{ id: string; name: string }>
  brand: { id: string; name: string } | null
  variants: Array<{
    title: string
    price: number
    compareAtPrice?: number
    inventory: number
    inStock: boolean
  }>
  updatedAt: string
}

export interface ProductsViewStats {
  total: number
  active: number
  draft: number
  archived: number
}

export interface ProductsViewData {
  products: ProductViewItem[]
  totalDocs: number
  totalPages: number
  page: number
  stats: ProductsViewStats
}

export interface ProductsViewParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'draft' | 'archived' | 'all'
  sort?: '-updatedAt' | 'title' | '-variants.price'
}

export async function getProductsViewData(
  params: ProductsViewParams = {}
): Promise<ProductsViewData> {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = 'all',
    sort = '-updatedAt',
  } = params

  const payload = await getPayload({ config })

  // Build `where` clause
  const statusFilter =
    status && status !== 'all' ? { status: { equals: status } } : {}

  const searchFilter = search.trim()
    ? {
        or: [
          { title: { contains: search.trim() } },
          { subtitle: { contains: search.trim() } },
          { handle: { contains: search.trim() } },
        ],
      }
    : {}

  const hasSearch = search.trim().length > 0
  const hasStatus = status && status !== 'all'

  let where: Record<string, any> = {}
  if (hasSearch && hasStatus) {
    where = { and: [statusFilter, searchFilter] }
  } else if (hasStatus) {
    where = statusFilter
  } else if (hasSearch) {
    where = searchFilter
  }

  // Fetch paginated products and all status counts in parallel
  const [result, activeCount, draftCount, archivedCount, totalCount] =
    await Promise.all([
      payload.find({
        collection: 'products',
        where,
        limit,
        page,
        sort,
        depth: 1, // populate thumbnail, categories, brand
      }),
      payload.count({
        collection: 'products',
        where: { status: { equals: 'active' } },
      }),
      payload.count({
        collection: 'products',
        where: { status: { equals: 'draft' } },
      }),
      payload.count({
        collection: 'products',
        where: { status: { equals: 'archived' } },
      }),
      payload.count({ collection: 'products' }),
    ])

  const products: ProductViewItem[] = result.docs.map((doc: any) => {
    // Thumbnail
    const thumbUrl = resolveMediaUrl(doc.thumbnail)
    const thumbnail = thumbUrl
      ? { url: thumbUrl, alt: resolveMediaAlt(doc.thumbnail) }
      : null

    // Categories (relationship, populated at depth:1 as objects)
    const categories: Array<{ id: string; name: string }> = Array.isArray(doc.categories)
      ? doc.categories
          .filter((c: any) => c && typeof c === 'object')
          .map((c: any) => ({ id: String(c.id), name: c.name ?? '' }))
      : []

    // Brand
    let brand: { id: string; name: string } | null = null
    if (doc.brand && typeof doc.brand === 'object') {
      brand = { id: String(doc.brand.id), name: doc.brand.name ?? '' }
    }

    // Variants
    const variants = Array.isArray(doc.variants)
      ? doc.variants.map((v: any) => ({
          title: v.title ?? '',
          price: v.price ?? 0,
          compareAtPrice: v.compareAtPrice ?? undefined,
          inventory: v.inventory ?? 0,
          inStock: v.inStock ?? false,
        }))
      : []

    return {
      id: doc.id,
      title: doc.title ?? '',
      subtitle: doc.subtitle ?? '',
      handle: doc.handle ?? '',
      status: doc.status ?? 'draft',
      thumbnail,
      categories,
      brand,
      variants,
      updatedAt: doc.updatedAt ?? '',
    }
  })

  return {
    products,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? page,
    stats: {
      total: totalCount.totalDocs,
      active: activeCount.totalDocs,
      draft: draftCount.totalDocs,
      archived: archivedCount.totalDocs,
    },
  }
}

// ─── Media library view ───────────────────────────────────────────────────────

export interface MediaFileItem {
  id: string | number
  filename: string
  alt: string
  mimeType: string
  filesize: number
  width: number
  height: number
  url: string
  thumbnailURL: string | null
  createdAt: string
  updatedAt: string
}

export interface MediaViewStats {
  totalFiles: number
  images: number
  videos: number
  others: number
}

export interface FolderCount {
  folder: string
  label: string
  count: number
}

export interface MediaViewData {
  files: MediaFileItem[]
  totalDocs: number
  totalPages: number
  page: number
  stats: MediaViewStats
  folders: FolderCount[]
}

export interface MediaViewParams {
  page?: number
  limit?: number
  search?: string
  mimeType?: string
  sort?: string
  folder?: string
}

const MEDIA_FOLDERS = [
  { value: 'products', label: 'Товари' },
  { value: 'banners', label: 'Банери' },
  { value: 'brands', label: 'Бренди' },
  { value: 'categories', label: 'Категорії' },
  { value: 'blog', label: 'Блог' },
  { value: 'other', label: 'Інше' },
] as const

export async function getMediaViewData(
  params: MediaViewParams = {}
): Promise<MediaViewData> {
  const {
    page = 1,
    limit = 20,
    search = '',
    mimeType = '',
    sort = '-createdAt',
    folder = '',
  } = params

  const payload = await getPayload({ config })

  // Build where clause
  const filters: Record<string, any>[] = []

  if (search.trim()) {
    filters.push({
      or: [
        { filename: { contains: search.trim() } },
        { alt: { contains: search.trim() } },
      ],
    })
  }

  if (mimeType.trim()) {
    // Support both exact ("image/png") and wildcard-category ("image") matching
    if (mimeType.includes('/')) {
      filters.push({ mimeType: { equals: mimeType.trim() } })
    } else {
      filters.push({ mimeType: { contains: mimeType.trim() } })
    }
  }

  if (folder.trim()) {
    filters.push({ folder: { equals: folder.trim() } })
  }

  const where: Record<string, any> =
    filters.length === 0 ? {} : filters.length === 1 ? filters[0] : { and: filters }

  // Fetch paginated files, stats counts, and folder counts in parallel
  const [result, imagesCount, videosCount, totalCount, ...folderCounts] = await Promise.all([
    payload.find({
      collection: 'media',
      where,
      limit,
      page,
      sort,
      depth: 0,
    }),
    payload.count({
      collection: 'media',
      where: { mimeType: { contains: 'image/' } },
    }),
    payload.count({
      collection: 'media',
      where: { mimeType: { contains: 'video/' } },
    }),
    payload.count({ collection: 'media' }),
    // Count for each folder
    ...MEDIA_FOLDERS.map((f) =>
      payload.count({
        collection: 'media',
        where: { folder: { equals: f.value } },
      })
    ),
  ])

  const files: MediaFileItem[] = result.docs.map((doc: any) => {
    // Prefer the generated thumbnail size URL if available
    const thumbnailURL: string | null =
      doc.sizes?.thumbnail?.url ?? null

    return {
      id: doc.id,
      filename: doc.filename ?? '',
      alt: doc.alt ?? '',
      mimeType: doc.mimeType ?? '',
      filesize: doc.filesize ?? 0,
      width: doc.width ?? 0,
      height: doc.height ?? 0,
      url: doc.url ?? '',
      thumbnailURL,
      createdAt: doc.createdAt ?? '',
      updatedAt: doc.updatedAt ?? '',
    }
  })

  const others =
    totalCount.totalDocs - imagesCount.totalDocs - videosCount.totalDocs

  const folders: FolderCount[] = MEDIA_FOLDERS.map((f, i) => ({
    folder: f.value,
    label: f.label,
    count: folderCounts[i].totalDocs,
  }))

  return {
    files,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? page,
    stats: {
      totalFiles: totalCount.totalDocs,
      images: imagesCount.totalDocs,
      videos: videosCount.totalDocs,
      others: others < 0 ? 0 : others,
    },
    folders,
  }
}

// ─── Banners view ─────────────────────────────────────────────────────────────

export interface BannerViewItem {
  id: string | number
  title: string
  image: { url: string; alt: string } | null
  link: string
  position: string
  order: number
  isActive: boolean
  mediaType: string
  createdAt: string
  updatedAt: string
}

export interface BannersViewStats {
  total: number
  active: number
  inactive: number
  home: number
  category: number
  promo: number
}

export interface BannersViewData {
  banners: BannerViewItem[]
  stats: BannersViewStats
}

export async function getBannersViewData(): Promise<BannersViewData> {
  const payload = await getPayload({ config })

  // Fetch all banners (no hard pagination — banners are typically a small set)
  // and per-position counts in parallel
  const [result, activeCount, homeCount, categoryCount, promoCount] =
    await Promise.all([
      payload.find({
        collection: 'banners',
        limit: 200,
        sort: 'order',
        depth: 1, // populate image relation
      }),
      payload.count({
        collection: 'banners',
        where: { isActive: { equals: true } },
      }),
      payload.count({
        collection: 'banners',
        where: { position: { equals: 'home' } },
      }),
      payload.count({
        collection: 'banners',
        where: { position: { equals: 'category' } },
      }),
      payload.count({
        collection: 'banners',
        where: { position: { equals: 'promo' } },
      }),
    ])

  const total = result.totalDocs

  const banners: BannerViewItem[] = result.docs.map((doc: any) => {
    const imgUrl = resolveMediaUrl(doc.image)
    const image = imgUrl
      ? { url: imgUrl, alt: resolveMediaAlt(doc.image) }
      : null

    return {
      id: doc.id,
      title: doc.title ?? '',
      image,
      link: doc.link ?? '',
      position: doc.position ?? '',
      order: doc.order ?? 0,
      isActive: doc.isActive ?? false,
      mediaType: doc.mediaType ?? 'image',
      createdAt: doc.createdAt ?? '',
      updatedAt: doc.updatedAt ?? '',
    }
  })

  return {
    banners,
    stats: {
      total,
      active: activeCount.totalDocs,
      inactive: total - activeCount.totalDocs,
      home: homeCount.totalDocs,
      category: categoryCount.totalDocs,
      promo: promoCount.totalDocs,
    },
  }
}

// ─── Banner mutations ─────────────────────────────────────────────────────────

export interface ToggleBannerResult {
  banner: BannerViewItem
  message: string
}

/**
 * Toggle a banner's isActive state.
 * Returns the updated banner document shaped as BannerViewItem.
 */
export async function toggleBannerActive(
  id: string | number,
  isActive: boolean
): Promise<ToggleBannerResult> {
  const payload = await getPayload({ config })

  const updated = await payload.update({
    collection: 'banners',
    id,
    data: { isActive },
    depth: 1,
  })

  const doc = updated as any
  const imgUrl = resolveMediaUrl(doc.image)
  const image = imgUrl ? { url: imgUrl, alt: resolveMediaAlt(doc.image) } : null

  const banner: BannerViewItem = {
    id: doc.id,
    title: doc.title ?? '',
    image,
    link: doc.link ?? '',
    position: doc.position ?? '',
    order: doc.order ?? 0,
    isActive: doc.isActive ?? false,
    mediaType: doc.mediaType ?? 'image',
    createdAt: doc.createdAt ?? '',
    updatedAt: doc.updatedAt ?? '',
  }

  return {
    banner,
    message: isActive ? 'Банер активовано' : 'Банер деактивовано',
  }
}

// ─── Delete mutations ─────────────────────────────────────────────────────────

export interface DeleteResult {
  success: boolean
  id: string | number
  message: string
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: string | number): Promise<DeleteResult> {
  const payload = await getPayload({ config })

  await payload.delete({ collection: 'products', id })

  return {
    success: true,
    id,
    message: 'Товар видалено',
  }
}

/**
 * Delete a banner by ID.
 */
export async function deleteBanner(id: string | number): Promise<DeleteResult> {
  const payload = await getPayload({ config })

  await payload.delete({ collection: 'banners', id })

  return {
    success: true,
    id,
    message: 'Банер видалено',
  }
}

/**
 * Delete a media file by ID.
 */
export async function deleteMediaFile(id: string | number): Promise<DeleteResult> {
  const payload = await getPayload({ config })

  await payload.delete({ collection: 'media', id })

  return {
    success: true,
    id,
    message: 'Медіафайл видалено',
  }
}


// ── Generic collection data ──

// Collections that use `isActive` checkbox instead of `status` select
const CHECKBOX_STATUS_COLLECTIONS = new Set(['categories'])

// Collections without any status/active field (no status filtering)
const NO_STATUS_COLLECTIONS = new Set(['customers', 'users', 'media', 'loyalty-points', 'loyalty-transactions'])

export async function getCollectionListData(
  collectionSlug: string,
  params: {
    page?: number
    limit?: number
    search?: string
    sort?: string
    status?: string
  } = {}
) {
  const payload = await getPayload({ config })
  const { page = 1, limit = 10, search, sort = '-updatedAt', status } = params

  const where: Record<string, any> = {}
  if (search) {
    where.or = [
      { title: { contains: search } },
      { name: { contains: search } },
    ]
  }

  // Apply status filter based on collection type
  if (status && status !== 'all') {
    if (CHECKBOX_STATUS_COLLECTIONS.has(collectionSlug)) {
      // Categories use isActive checkbox: 'active' → true, 'inactive' → false
      where.isActive = { equals: status === 'active' }
    } else if (!NO_STATUS_COLLECTIONS.has(collectionSlug)) {
      where.status = { equals: status }
    }
  }

  try {
    const result = await payload.find({
      collection: collectionSlug as any,
      page,
      limit,
      sort,
      depth: 1,
      where: Object.keys(where).length > 0 ? where : undefined,
    })

    // Count stats based on collection type
    let activeCount = 0, draftCount = 0, archivedCount = 0

    if (CHECKBOX_STATUS_COLLECTIONS.has(collectionSlug)) {
      // For categories: active = isActive:true, draft(inactive) = isActive:false
      try { activeCount = (await payload.count({ collection: collectionSlug as any, where: { isActive: { equals: true } } })).totalDocs } catch {}
      try { draftCount = (await payload.count({ collection: collectionSlug as any, where: { isActive: { equals: false } } })).totalDocs } catch {}
    } else if (!NO_STATUS_COLLECTIONS.has(collectionSlug)) {
      // For orders: active = pending, draft = completed, archived = canceled
      // For other collections: standard active/draft/archived
      if (collectionSlug === 'orders') {
        try { activeCount = (await payload.count({ collection: collectionSlug as any, where: { status: { equals: 'pending' } } })).totalDocs } catch {}
        try { draftCount = (await payload.count({ collection: collectionSlug as any, where: { status: { equals: 'completed' } } })).totalDocs } catch {}
        try { archivedCount = (await payload.count({ collection: collectionSlug as any, where: { status: { equals: 'canceled' } } })).totalDocs } catch {}
      } else {
        try { activeCount = (await payload.count({ collection: collectionSlug as any, where: { status: { equals: 'active' } } })).totalDocs } catch {}
        try { draftCount = (await payload.count({ collection: collectionSlug as any, where: { status: { equals: 'draft' } } })).totalDocs } catch {}
        try { archivedCount = (await payload.count({ collection: collectionSlug as any, where: { status: { equals: 'archived' } } })).totalDocs } catch {}
      }
    }

    // For stats.total, always use unfiltered count
    const totalCount = (status && status !== 'all')
      ? (await payload.count({ collection: collectionSlug as any })).totalDocs
      : result.totalDocs

    return {
      docs: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page || 1,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      stats: { total: totalCount, active: activeCount, draft: draftCount, archived: archivedCount },
    }
  } catch (error) {
    console.error(`Error fetching ${collectionSlug}:`, error)
    return { docs: [], totalDocs: 0, totalPages: 0, page: 1, hasNextPage: false, hasPrevPage: false, stats: { total: 0, active: 0, draft: 0, archived: 0 } }
  }
}

/**
 * Field metadata returned to the client for proper rendering.
 */
export interface FieldSchema {
  name: string
  label?: string
  type: string
  required?: boolean
  hidden?: boolean
  readOnly?: boolean
  position?: string
  options?: { label: string; value: string }[]
  relationTo?: string
  hasMany?: boolean
  labels?: { singular?: string; plural?: string }
  fields?: FieldSchema[] // for group/array sub-fields
}

export interface CollectionFieldData {
  defaults: Record<string, any>
  schema: FieldSchema[]
}

/**
 * Get field defaults + schema for a collection (used for create & edit rendering).
 * Reads the Payload config and returns both default values and field metadata.
 */
export async function getCollectionFieldDefaults(
  collectionSlug: string
): Promise<CollectionFieldData> {
  const payload = await getPayload({ config })
  const collection = payload.config.collections.find(
    (c: any) => c.slug === collectionSlug
  )
  if (!collection) return { defaults: {}, schema: [] }

  const defaults: Record<string, any> = {}
  const schema: FieldSchema[] = []

  const SKIP = new Set(['id', 'createdAt', 'updatedAt', 'sizes', '_status'])

  function normalizeOptions(opts: any[]): { label: string; value: string }[] {
    return (opts || []).map((o: any) =>
      typeof o === 'string' ? { label: o, value: o } : { label: o.label || o.value, value: o.value }
    )
  }

  function processField(field: any): FieldSchema | null {
    if (!field.name || SKIP.has(field.name)) return null

    const meta: FieldSchema = {
      name: field.name,
      label: field.label || undefined,
      type: field.type,
      required: field.required || false,
      hidden: field.admin?.hidden || false,
      readOnly: field.admin?.readOnly || false,
      position: field.admin?.position || undefined,
    }
    if (field.labels) {
      meta.labels = { singular: field.labels.singular, plural: field.labels.plural }
    }

    switch (field.type) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'code':
        defaults[field.name] = field.defaultValue ?? ''
        break
      case 'number':
        defaults[field.name] = field.defaultValue ?? 0
        break
      case 'checkbox':
        defaults[field.name] = field.defaultValue ?? false
        break
      case 'select':
        meta.options = normalizeOptions(field.options)
        defaults[field.name] = field.defaultValue ?? (meta.options[0]?.value || '')
        break
      case 'date':
        defaults[field.name] = field.defaultValue ?? ''
        break
      case 'richText':
        defaults[field.name] = field.defaultValue ?? ''
        break
      case 'json':
        defaults[field.name] = field.defaultValue ?? null
        break
      case 'upload':
        meta.relationTo = typeof field.relationTo === 'string' ? field.relationTo : undefined
        defaults[field.name] = null
        break
      case 'relationship':
        meta.relationTo = typeof field.relationTo === 'string' ? field.relationTo : undefined
        meta.hasMany = field.hasMany || false
        defaults[field.name] = field.hasMany ? [] : null
        break
      case 'array':
        defaults[field.name] = []
        if (field.fields) {
          meta.fields = field.fields
            .map((sf: any) => processSubField(sf))
            .filter(Boolean) as FieldSchema[]
        }
        break
      case 'group':
        if (field.fields) {
          const groupDefaults: Record<string, any> = {}
          meta.fields = []
          for (const sf of field.fields) {
            if (!sf.name) continue
            const subMeta = processSubField(sf)
            if (subMeta) meta.fields.push(subMeta)
            switch (sf.type) {
              case 'text': case 'textarea': case 'email': case 'code':
                groupDefaults[sf.name] = sf.defaultValue ?? ''; break
              case 'number':
                groupDefaults[sf.name] = sf.defaultValue ?? 0; break
              case 'checkbox':
                groupDefaults[sf.name] = sf.defaultValue ?? false; break
              case 'select':
                groupDefaults[sf.name] = sf.defaultValue ?? (normalizeOptions(sf.options)[0]?.value || ''); break
              case 'upload': case 'relationship':
                groupDefaults[sf.name] = null; break
              default:
                groupDefaults[sf.name] = sf.defaultValue ?? ''
            }
          }
          defaults[field.name] = groupDefaults
        }
        break
      default:
        defaults[field.name] = field.defaultValue ?? ''
    }

    return meta
  }

  function processSubField(field: any): FieldSchema | null {
    if (!field.name) return null
    const meta: FieldSchema = {
      name: field.name,
      label: field.label || undefined,
      type: field.type,
      required: field.required || false,
      hidden: field.admin?.hidden || false,
      readOnly: field.admin?.readOnly || false,
    }
    if (field.type === 'select') meta.options = normalizeOptions(field.options)
    if (field.type === 'upload') meta.relationTo = typeof field.relationTo === 'string' ? field.relationTo : undefined
    if (field.type === 'relationship') {
      meta.relationTo = typeof field.relationTo === 'string' ? field.relationTo : undefined
      meta.hasMany = field.hasMany || false
    }
    return meta
  }

  for (const field of collection.fields || []) {
    const meta = processField(field)
    if (meta) schema.push(meta)
  }

  return { defaults, schema }
}

export async function deleteCollectionDoc(collectionSlug: string, id: string | number) {
  const payload = await getPayload({ config })
  try {
    await payload.delete({ collection: collectionSlug as any, id })
    return { success: true, message: 'Документ видалено' }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
