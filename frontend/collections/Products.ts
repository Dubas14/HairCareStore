import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { collectionAccess } from '@/lib/payload/access'
import { invalidateChatCache } from '@/lib/chat/product-context-cache'

const LOW_STOCK_THRESHOLD = 5

/**
 * When a product's price drops, find customers who have it in their wishlist
 * and send them a price drop notification email.
 */
const priceDropNotificationHook: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc?.variants || !doc?.variants) return doc

  const oldPrice = previousDoc.variants[0]?.price
  const newPrice = doc.variants[0]?.price
  if (!oldPrice || !newPrice || newPrice >= oldPrice) return doc

  // Price actually dropped — fire-and-forget email notifications
  const imageUrl = typeof doc.thumbnail === 'object' && doc.thumbnail?.url
    ? doc.thumbnail.url
    : undefined

  setImmediate(async () => {
    try {
      // Find customers who have this product in their wishlist
      const result = await req.payload.find({
        collection: 'customers',
        where: { wishlist: { contains: doc.id } },
        limit: 200,
        depth: 0,
      })

      if (result.docs.length === 0) return

      const { sendPriceDropEmail } = await import('@/lib/email/email-actions')

      for (const customer of result.docs) {
        const email = customer.email as string
        const name = (customer.firstName as string) || ''
        if (!email) continue

        sendPriceDropEmail({
          email,
          customerName: name,
          items: [{
            title: doc.title as string,
            handle: doc.handle as string,
            imageUrl,
            oldPrice,
            newPrice,
          }],
        }).catch(() => {
          // Silently ignore individual email failures
        })
      }
    } catch {
      // Don't fail the product update if notifications fail
    }
  })

  return doc
}

/**
 * When a product comes back in stock, find customers who have it in their wishlist
 * and send them a back-in-stock notification email.
 */
const backInStockNotificationHook: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  if (operation !== 'update' || !previousDoc?.variants || !doc?.variants) return doc

  // Check if any variant went from out-of-stock to in-stock
  const wasAllOutOfStock = previousDoc.variants.every((v: Record<string, unknown>) => !v.inStock)
  const hasInStockNow = doc.variants.some((v: Record<string, unknown>) => v.inStock)

  if (!wasAllOutOfStock || !hasInStockNow) return doc

  const imageUrl = typeof doc.thumbnail === 'object' && doc.thumbnail?.url
    ? doc.thumbnail.url
    : undefined

  const firstPrice = doc.variants[0]?.price as number || 0

  setImmediate(async () => {
    try {
      const result = await req.payload.find({
        collection: 'customers',
        where: { wishlist: { contains: doc.id } },
        limit: 200,
        depth: 0,
      })

      if (result.docs.length === 0) return

      const { sendBackInStockEmail } = await import('@/lib/email/email-actions')

      for (const customer of result.docs) {
        const email = customer.email as string
        const name = (customer.firstName as string) || ''
        if (!email) continue

        sendBackInStockEmail({
          email,
          customerName: name,
          items: [{
            title: doc.title as string,
            handle: doc.handle as string,
            imageUrl,
            price: firstPrice,
          }],
        }).catch(() => {})
      }
    } catch {
      // Don't fail the product update
    }
  })

  return doc
}

const autoInventoryHook: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (!doc?.variants || !Array.isArray(doc.variants)) return doc

  let needsUpdate = false
  const updatedVariants = doc.variants.map((variant: Record<string, unknown>, idx: number) => {
    const inventory = (variant.inventory as number) ?? 0
    const wasInStock = previousDoc?.variants?.[idx]?.inStock

    // Auto-set inStock based on inventory
    if (inventory <= 0 && variant.inStock) {
      needsUpdate = true
      return { ...variant, inStock: false }
    }
    if (inventory > 0 && !variant.inStock && wasInStock === false) {
      needsUpdate = true
      return { ...variant, inStock: true }
    }

    // Log low stock warning
    if (inventory > 0 && inventory <= LOW_STOCK_THRESHOLD) {
      req.payload.logger.warn(
        `Low stock: "${doc.title}" variant "${variant.title}" has only ${inventory} units`
      )
    }

    return variant
  })

  if (needsUpdate) {
    await req.payload.update({
      collection: 'products',
      id: doc.id,
      data: { variants: updatedVariants },
      depth: 0,
    })
  }

  return doc
}

/** Invalidate AI chat cache when products change */
const invalidateChatCacheAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  invalidateChatCache()
  return doc
}

const invalidateChatCacheAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  invalidateChatCache()
  return doc
}

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товари' },
  hooks: {
    afterChange: [autoInventoryHook, priceDropNotificationHook, backInStockNotificationHook, invalidateChatCacheAfterChange],
    afterDelete: [invalidateChatCacheAfterDelete],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'status', 'updatedAt'],
    group: 'Каталог',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/products/ProductsListView',
        },
        edit: {
          root: {
            Component: '/components/payload/views/products/ProductEditView',
          },
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return true
      return collectionAccess('products', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('products', 'create'),
    update: collectionAccess('products', 'update'),
    delete: collectionAccess('products', 'delete'),
  },
  fields: [
    // ── Основна інформація (завжди видима) ──
    { name: 'title', label: 'Назва', type: 'text', required: true, localized: true },
    { name: 'handle', label: 'URL (slug)', type: 'text', required: true, unique: true, admin: { position: 'sidebar', description: 'Унікальний ідентифікатор для URL товару' } },
    { name: 'subtitle', label: 'Підзаголовок', type: 'text', localized: true, admin: { description: 'Назва бренду або короткий слоган' } },
    { name: 'status', label: 'Статус', type: 'select', defaultValue: 'draft', options: [{ label: 'Чернетка', value: 'draft' }, { label: 'Активний', value: 'active' }, { label: 'В архіві', value: 'archived' }], admin: { position: 'sidebar' } },
    { name: 'barcode', label: 'Штрих-код', type: 'text', unique: true, index: true, admin: { position: 'sidebar', description: 'EAN-13/EAN-8' } },
    { name: 'categories', label: 'Категорії', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'brand', label: 'Бренд', type: 'relationship', relationTo: 'brands' },
    // ── Sidebar stats ──
    { name: 'averageRating', label: 'Середній рейтинг', type: 'number', defaultValue: 0, min: 0, max: 5, admin: { position: 'sidebar', readOnly: true } },
    { name: 'reviewCount', label: 'Кількість відгуків', type: 'number', defaultValue: 0, min: 0, admin: { position: 'sidebar', readOnly: true } },
    { name: 'salesCount', label: 'Кількість продажів', type: 'number', defaultValue: 0, min: 0, admin: { position: 'sidebar', readOnly: true } },
    // ── Tabs для решти контенту ──
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Опис',
          fields: [
            { name: 'description', label: 'Повний опис', type: 'richText', localized: true },
          ],
        },
        {
          label: 'Медіа',
          fields: [
            { name: 'thumbnail', label: 'Мініатюра', type: 'upload', relationTo: 'media', admin: { description: 'Головне зображення товару' } },
            {
              name: 'images',
              label: 'Галерея зображень',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [{ name: 'image', label: 'Зображення', type: 'upload', relationTo: 'media', required: true }],
            },
          ],
        },
        {
          label: 'Варіанти та ціни',
          fields: [
            {
              name: 'variants',
              label: 'Варіанти товару',
              type: 'array',
              required: true,
              minRows: 1,
              admin: { initCollapsed: false, description: 'Мінімум один варіант обовʼязковий' },
              fields: [
                { name: 'title', label: 'Назва варіанту', type: 'text', required: true, localized: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'price', label: 'Ціна', type: 'number', required: true, min: 0 },
                    { name: 'compareAtPrice', label: 'Стара ціна', type: 'number', min: 0 },
                    { name: 'costPrice', label: 'Собівартість', type: 'number', min: 0 },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'sku', label: 'Артикул (SKU)', type: 'text' },
                    { name: 'supplierCode', label: 'Код постачальника', type: 'text' },
                    { name: 'articleCode', label: 'Артикул', type: 'text' },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'inStock', label: 'В наявності', type: 'checkbox', defaultValue: true },
                    { name: 'inventory', label: 'Залишок на складі', type: 'number', defaultValue: 0, min: 0 },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Опції та теги',
          fields: [
            {
              name: 'options',
              label: 'Опції товару',
              type: 'array',
              admin: { initCollapsed: true, description: 'Наприклад: обʼєм, колір' },
              fields: [
                { name: 'title', label: 'Назва опції', type: 'text', required: true },
                { name: 'values', label: 'Значення', type: 'array', fields: [{ name: 'value', label: 'Значення', type: 'text', required: true }] },
              ],
            },
            {
              name: 'tags',
              label: 'Теги',
              type: 'array',
              admin: { initCollapsed: true },
              fields: [{ name: 'tag', label: 'Тег', type: 'text', required: true }],
            },
            {
              name: 'ingredients',
              label: 'Інгредієнти',
              type: 'relationship',
              relationTo: 'ingredients',
              hasMany: true,
            },
          ],
        },
      ],
    },
  ],
}
