'use server'

import { z } from 'zod'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { generateEAN13, isValidBarcode, isInternalBarcode } from '@/lib/utils/barcode'
import { generateHandle } from '@/lib/utils/transliterate'

// ─── Auth ────────────────────────────────────────────────────────────────────

async function requireAdmin(): Promise<void> {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const cookieHeader = headersList.get('cookie') || ''
  try {
    const { user } = await payload.auth({ headers: new Headers({ cookie: cookieHeader }) })
    if (!user || (user as any).collection !== 'users') {
      throw new Error('Unauthorized')
    }
  } catch {
    throw new Error('Unauthorized: admin access required')
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CsvProductRow {
  title: string
  barcode?: string
  handle?: string
  subtitle?: string
  brand?: string
  category?: string
  sku?: string
  articleCode?: string
  supplierCode?: string
  price: number
  costPrice?: number
  compareAtPrice?: number
  inventory?: number
  inStock?: boolean
  status?: 'draft' | 'active' | 'archived'
  tags?: string
}

export interface ImportResult {
  created: number
  updated: number
  errors: Array<{ row: number; message: string }>
  total: number
}

// ─── Validation ──────────────────────────────────────────────────────────────

const csvRowSchema = z.object({
  title: z.string().min(1, 'Назва товару обовʼязкова'),
  price: z.number().positive('Ціна повинна бути більше 0'),
  barcode: z.string().optional(),
  handle: z.string().optional(),
  subtitle: z.string().optional(),
  brand: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  articleCode: z.string().optional(),
  supplierCode: z.string().optional(),
  costPrice: z.number().min(0).optional(),
  compareAtPrice: z.number().min(0).optional(),
  inventory: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  tags: z.string().optional(),
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getNextInternalBarcodeSequence(payload: any): Promise<number> {
  // Find the max internal barcode (prefix 200) to determine next sequence
  const existing = await payload.find({
    collection: 'products',
    where: {
      barcode: { like: '200%' },
    },
    sort: '-barcode',
    limit: 1,
    depth: 0,
  })

  if (existing.docs.length === 0) return 1

  const maxBarcode = existing.docs[0].barcode as string
  // Extract sequence: skip prefix "200" (3 chars), take next 9 chars
  const seqStr = maxBarcode.slice(3, 12)
  return parseInt(seqStr, 10) + 1
}

async function resolveBrand(
  payload: any,
  name: string,
  cache: Map<string, number | string>,
): Promise<number | string> {
  const key = name.toLowerCase().trim()
  if (cache.has(key)) return cache.get(key)!

  // Search existing
  const found = await payload.find({
    collection: 'brands',
    where: { name: { equals: name.trim() } },
    limit: 1,
    depth: 0,
  })

  if (found.docs.length > 0) {
    cache.set(key, found.docs[0].id)
    return found.docs[0].id
  }

  // Create new brand
  const slug = generateHandle(name.trim())
  const created = await payload.create({
    collection: 'brands',
    data: {
      name: name.trim(),
      slug,
      order: 0,
      isActive: true,
    },
  })
  cache.set(key, created.id)
  return created.id
}

async function resolveCategories(
  payload: any,
  names: string,
  cache: Map<string, number | string>,
): Promise<Array<number | string>> {
  const parts = names.split('|').map((n) => n.trim()).filter(Boolean)
  const ids: Array<number | string> = []

  for (const name of parts) {
    const key = name.toLowerCase()
    if (cache.has(key)) {
      ids.push(cache.get(key)!)
      continue
    }

    const found = await payload.find({
      collection: 'categories',
      where: { name: { equals: name } },
      limit: 1,
      depth: 0,
    })

    if (found.docs.length > 0) {
      cache.set(key, found.docs[0].id)
      ids.push(found.docs[0].id)
    } else {
      const slug = generateHandle(name)
      const created = await payload.create({
        collection: 'categories',
        data: {
          name,
          slug,
          order: 0,
          isActive: true,
        },
      })
      cache.set(key, created.id)
      ids.push(created.id)
    }
  }

  return ids
}

// ─── Main Import Action ──────────────────────────────────────────────────────

export async function importProducts(rows: CsvProductRow[]): Promise<ImportResult> {
  await requireAdmin()

  const payload = await getPayload({ config })
  const result: ImportResult = { created: 0, updated: 0, errors: [], total: rows.length }

  const brandCache = new Map<string, number | string>()
  const categoryCache = new Map<string, number | string>()
  let nextSequence = await getNextInternalBarcodeSequence(payload)

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1
    try {
      const validation = csvRowSchema.safeParse(rows[i])
      if (!validation.success) {
        const msgs = validation.error.issues.map((iss) => iss.message).join('; ')
        result.errors.push({ row: rowNum, message: msgs })
        continue
      }

      const row = validation.data

      // Validate barcode format if provided
      if (row.barcode && !isValidBarcode(row.barcode)) {
        result.errors.push({ row: rowNum, message: `Невалідний штрих-код: ${row.barcode}` })
        continue
      }

      // Generate barcode if not provided
      const barcode = row.barcode || generateEAN13(nextSequence++)

      // Generate handle if not provided
      const handle = row.handle || generateHandle(row.title)

      // Resolve brand
      let brandId: number | string | undefined
      if (row.brand) {
        brandId = await resolveBrand(payload, row.brand, brandCache)
      }

      // Resolve categories
      let categoryIds: Array<number | string> = []
      if (row.category) {
        categoryIds = await resolveCategories(payload, row.category, categoryCache)
      }

      // Build tags array
      const tags = row.tags
        ? row.tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag) => ({ tag }))
        : undefined

      // Build variant
      const variant = {
        title: row.title,
        sku: row.sku || undefined,
        price: row.price,
        costPrice: row.costPrice || undefined,
        compareAtPrice: row.compareAtPrice || undefined,
        supplierCode: row.supplierCode || undefined,
        articleCode: row.articleCode || undefined,
        inStock: row.inStock ?? true,
        inventory: row.inventory ?? 0,
      }

      // Check if product with this barcode exists
      const existing = await payload.find({
        collection: 'products',
        where: { barcode: { equals: barcode } },
        limit: 1,
        depth: 0,
      })

      if (existing.docs.length > 0) {
        // Update existing product
        const existingProduct = existing.docs[0]
        await payload.update({
          collection: 'products',
          id: existingProduct.id,
          data: {
            title: row.title,
            handle,
            barcode,
            subtitle: row.subtitle || undefined,
            brand: brandId || undefined,
            categories: categoryIds.length > 0 ? categoryIds : undefined,
            variants: [variant],
            tags,
            status: row.status || existingProduct.status || 'draft',
          },
        })
        result.updated++
      } else {
        // Ensure unique handle
        let finalHandle = handle
        const handleExists = await payload.find({
          collection: 'products',
          where: { handle: { equals: finalHandle } },
          limit: 1,
          depth: 0,
        })
        if (handleExists.docs.length > 0) {
          finalHandle = `${handle}-${Date.now().toString(36)}`
        }

        // Create new product
        await payload.create({
          collection: 'products',
          data: {
            title: row.title,
            handle: finalHandle,
            barcode,
            subtitle: row.subtitle || undefined,
            brand: brandId || undefined,
            categories: categoryIds.length > 0 ? categoryIds : undefined,
            variants: [variant],
            tags,
            status: row.status || 'draft',
          },
        })
        result.created++
      }
    } catch (err: any) {
      result.errors.push({
        row: rowNum,
        message: err?.message || 'Невідома помилка',
      })
    }
  }

  return result
}
