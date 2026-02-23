'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

// ── Analytics Types ──────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  label: string
  revenue: number
  orders: number
}

export interface OrderStatusBreakdown {
  status: string
  label: string
  count: number
  color: string
}

export interface TopProduct {
  id: string | number
  title: string
  handle: string
  totalQuantity: number
  totalRevenue: number
  thumbnail: string | null
}

export interface LowStockItem {
  productId: string | number
  productTitle: string
  handle: string
  variantTitle: string
  sku: string
  inventory: number
  price: number
}

export interface AbandonedCartStats {
  abandonedCount: number
  abandonedValue: number
  recoveredCount: number
  recoveryRate: number
  averageCartValue: number
  emailsSentTotal: number
}

export interface DashboardStats {
  productsCount: number
  ordersCount: number
  customersCount: number
  reviewsCount: number
  revenue: number
  recentOrders: Array<{
    id: string
    displayId: number
    email: string
    total: number
    status: string
    paymentStatus: string
    createdAt: string
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const payload = await getPayload({ config })

  const [productsResult, ordersResult, customersResult, reviewsResult, recentOrdersResult] =
    await Promise.all([
      payload.count({ collection: 'products', where: { status: { equals: 'active' } } }),
      payload.count({ collection: 'orders' }),
      payload.count({ collection: 'customers' }),
      payload.count({ collection: 'reviews' }),
      payload.find({
        collection: 'orders',
        sort: '-createdAt',
        limit: 5,
      }),
    ])

  // Calculate revenue from all non-canceled orders
  let revenue = 0
  if (ordersResult.totalDocs > 0) {
    const allOrders = await payload.find({
      collection: 'orders',
      limit: 10000,
      where: { status: { not_equals: 'canceled' } },
    })
    revenue = allOrders.docs.reduce((sum, order) => sum + ((order as unknown as { total?: number }).total || 0), 0)
  }

  return {
    productsCount: productsResult.totalDocs,
    ordersCount: ordersResult.totalDocs,
    customersCount: customersResult.totalDocs,
    reviewsCount: reviewsResult.totalDocs,
    revenue,
    recentOrders: recentOrdersResult.docs.map((order) => {
      const o = order as unknown as Record<string, unknown>
      return {
        id: String(o.id),
        displayId: (o.displayId as number) || 0,
        email: (o.email as string) || '',
        total: (o.total as number) || 0,
        status: (o.status as string) || 'pending',
        paymentStatus: (o.paymentStatus as string) || 'awaiting',
        createdAt: o.createdAt as string,
      }
    }),
  }
}

// ── Revenue Over Time ────────────────────────────────────────────────────────

export async function getRevenueOverTime(
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
): Promise<RevenueDataPoint[]> {
  const payload = await getPayload({ config })

  const now = new Date()
  let startDate: Date
  let bucketCount: number
  let bucketMs: number
  let formatLabel: (d: Date) => string

  switch (period) {
    case 'daily':
      bucketCount = 14
      startDate = new Date(now.getTime() - 14 * 86400000)
      bucketMs = 86400000
      formatLabel = (d) =>
        d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })
      break
    case 'weekly':
      bucketCount = 8
      startDate = new Date(now.getTime() - 8 * 7 * 86400000)
      bucketMs = 7 * 86400000
      formatLabel = (d) => {
        const end = new Date(d.getTime() + 6 * 86400000)
        return `${d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}–${end.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' })}`
      }
      break
    case 'monthly':
      bucketCount = 6
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      bucketMs = 0 // handled separately
      formatLabel = (d) =>
        d.toLocaleDateString('uk-UA', { month: 'short', year: '2-digit' })
      break
  }

  const orders = await payload.find({
    collection: 'orders',
    limit: 10000,
    where: {
      and: [
        { status: { not_equals: 'canceled' } },
        { createdAt: { greater_than_equal: startDate.toISOString() } },
      ],
    },
  })

  // Build buckets
  const buckets: RevenueDataPoint[] = []

  if (period === 'monthly') {
    for (let i = 0; i < bucketCount; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (bucketCount - 1 - i), 1)
      buckets.push({ label: formatLabel(d), revenue: 0, orders: 0 })
    }
    for (const doc of orders.docs) {
      const o = doc as unknown as { total?: number; createdAt: string }
      const d = new Date(o.createdAt)
      const idx = (d.getFullYear() - startDate.getFullYear()) * 12 + d.getMonth() - startDate.getMonth()
      if (idx >= 0 && idx < bucketCount) {
        buckets[idx].revenue += o.total || 0
        buckets[idx].orders += 1
      }
    }
  } else {
    for (let i = 0; i < bucketCount; i++) {
      const d = new Date(startDate.getTime() + i * bucketMs)
      buckets.push({ label: formatLabel(d), revenue: 0, orders: 0 })
    }
    for (const doc of orders.docs) {
      const o = doc as unknown as { total?: number; createdAt: string }
      const d = new Date(o.createdAt)
      const idx = Math.floor((d.getTime() - startDate.getTime()) / bucketMs)
      if (idx >= 0 && idx < bucketCount) {
        buckets[idx].revenue += o.total || 0
        buckets[idx].orders += 1
      }
    }
  }

  return buckets
}

// ── Orders By Status ─────────────────────────────────────────────────────────

const statusConfig: Array<{ status: string; label: string; color: string }> = [
  { status: 'pending', label: 'В обробці', color: '#f59e0b' },
  { status: 'completed', label: 'Виконано', color: '#10b981' },
  { status: 'canceled', label: 'Скасовано', color: '#ef4444' },
  { status: 'requires_action', label: 'Потребує дій', color: '#f97316' },
  { status: 'archived', label: 'Архів', color: '#94a3b8' },
]

export async function getOrdersByStatus(): Promise<OrderStatusBreakdown[]> {
  const payload = await getPayload({ config })

  const counts = await Promise.all(
    statusConfig.map((s) =>
      payload.count({ collection: 'orders', where: { status: { equals: s.status } } }),
    ),
  )

  return statusConfig
    .map((s, i) => ({
      status: s.status,
      label: s.label,
      count: counts[i].totalDocs,
      color: s.color,
    }))
    .filter((s) => s.count > 0)
}

// ── Top Products ─────────────────────────────────────────────────────────────

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const payload = await getPayload({ config })

  const orders = await payload.find({
    collection: 'orders',
    limit: 10000,
    where: { status: { not_equals: 'canceled' } },
  })

  // Aggregate by productId
  const agg = new Map<
    string,
    { title: string; totalQuantity: number; totalRevenue: number }
  >()

  for (const doc of orders.docs) {
    const o = doc as unknown as {
      items?: Array<{
        productId?: number
        productTitle?: string
        quantity?: number
        subtotal?: number
      }>
    }
    if (!o.items) continue
    for (const item of o.items) {
      const key = String(item.productId || item.productTitle || 'unknown')
      const existing = agg.get(key)
      if (existing) {
        existing.totalQuantity += item.quantity || 0
        existing.totalRevenue += item.subtotal || 0
      } else {
        agg.set(key, {
          title: item.productTitle || 'Без назви',
          totalQuantity: item.quantity || 0,
          totalRevenue: item.subtotal || 0,
        })
      }
    }
  }

  // Sort by quantity desc
  const sorted = [...agg.entries()]
    .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
    .slice(0, limit)

  // Enrich with product data (thumbnail, handle)
  const results: TopProduct[] = []
  for (const [key, data] of sorted) {
    let thumbnail: string | null = null
    let handle = ''
    let id: string | number = key

    const numericId = Number(key)
    if (!isNaN(numericId)) {
      try {
        const product = await payload.findByID({ collection: 'products', id: numericId })
        if (product) {
          const p = product as unknown as {
            handle?: string
            thumbnail?: { url?: string } | null
          }
          handle = p.handle || ''
          thumbnail = p.thumbnail?.url || null
          id = numericId
        }
      } catch {
        // Product may have been deleted
      }
    }

    results.push({
      id,
      title: data.title,
      handle,
      totalQuantity: data.totalQuantity,
      totalRevenue: data.totalRevenue,
      thumbnail,
    })
  }

  return results
}

// ── Low Stock Products ───────────────────────────────────────────────────────

export async function getLowStockProducts(threshold = 5): Promise<LowStockItem[]> {
  const payload = await getPayload({ config })

  const products = await payload.find({
    collection: 'products',
    limit: 10000,
    where: { status: { equals: 'active' } },
  })

  const lowStock: LowStockItem[] = []

  for (const doc of products.docs) {
    const p = doc as unknown as {
      id: number | string
      title: string
      handle: string
      variants?: Array<{
        title?: string
        sku?: string
        inventory?: number
        price?: number
      }>
    }
    if (!p.variants) continue

    for (const v of p.variants) {
      const inv = v.inventory ?? 0
      if (inv <= threshold && inv >= 0) {
        lowStock.push({
          productId: p.id,
          productTitle: p.title || 'Без назви',
          handle: p.handle || '',
          variantTitle: v.title || '',
          sku: v.sku || '',
          inventory: inv,
          price: v.price || 0,
        })
      }
    }
  }

  return lowStock.sort((a, b) => a.inventory - b.inventory)
}

// ── Abandoned Cart Stats ─────────────────────────────────────────────────────

export async function getAbandonedCartStats(): Promise<AbandonedCartStats> {
  const payload = await getPayload({ config })

  const [abandonedResult, recoveredResult] = await Promise.all([
    payload.find({
      collection: 'carts',
      limit: 10000,
      where: { status: { equals: 'abandoned' } },
    }),
    payload.find({
      collection: 'carts',
      limit: 10000,
      where: {
        and: [
          { status: { equals: 'completed' } },
          { abandonedEmailsSent: { greater_than: 0 } },
        ],
      },
    }),
  ])

  const abandonedCount = abandonedResult.totalDocs
  const abandonedValue = abandonedResult.docs.reduce((sum, doc) => {
    const c = doc as unknown as { total?: number }
    return sum + (c.total || 0)
  }, 0)

  const recoveredCount = recoveredResult.totalDocs

  const emailsSentTotal = abandonedResult.docs.reduce((sum, doc) => {
    const c = doc as unknown as { abandonedEmailsSent?: number }
    return sum + (c.abandonedEmailsSent || 0)
  }, 0) + recoveredResult.docs.reduce((sum, doc) => {
    const c = doc as unknown as { abandonedEmailsSent?: number }
    return sum + (c.abandonedEmailsSent || 0)
  }, 0)

  const totalCarts = abandonedCount + recoveredCount
  const recoveryRate = totalCarts > 0 ? (recoveredCount / totalCarts) * 100 : 0
  const averageCartValue = abandonedCount > 0 ? abandonedValue / abandonedCount : 0

  return {
    abandonedCount,
    abandonedValue,
    recoveredCount,
    recoveryRate,
    averageCartValue,
    emailsSentTotal,
  }
}
