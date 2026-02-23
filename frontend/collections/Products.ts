import type { CollectionConfig, CollectionAfterChangeHook } from 'payload'

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

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Товар', plural: 'Товари' },
  hooks: {
    afterChange: [autoInventoryHook, priceDropNotificationHook],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'handle', 'status', 'updatedAt'],
    group: 'Магазин',
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
    read: () => true,
    create: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    update: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'handle', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    {
      name: 'barcode',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Штрих-код (EAN-13/EAN-8). Унікальний ідентифікатор товару',
      },
    },
    { name: 'subtitle', type: 'text', localized: true, admin: { description: 'Brand name or short tagline' } },
    { name: 'description', type: 'richText', localized: true },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    {
      name: 'images',
      type: 'array',
      fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
    },
    {
      name: 'variants',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'sku', type: 'text' },
        { name: 'price', type: 'number', required: true, min: 0, admin: { description: 'Price in UAH (major units)' } },
        { name: 'costPrice', type: 'number', min: 0, admin: { description: 'Ціна ходу/закупівлі (салонна ціна), грн' } },
        { name: 'compareAtPrice', type: 'number', min: 0, admin: { description: 'Original price before discount' } },
        { name: 'supplierCode', type: 'text', admin: { description: 'Код постачальника (напр. 000002145)' } },
        { name: 'articleCode', type: 'text', admin: { description: 'Артикул товару (напр. 510442)' } },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
        { name: 'inventory', type: 'number', defaultValue: 0, min: 0 },
      ],
    },
    {
      name: 'options',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'values', type: 'array', fields: [{ name: 'value', type: 'text', required: true }] },
      ],
    },
    { name: 'categories', type: 'relationship', relationTo: 'categories', hasMany: true },
    { name: 'brand', type: 'relationship', relationTo: 'brands' },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
    },
    {
      name: 'ingredients',
      type: 'relationship',
      relationTo: 'ingredients',
      hasMany: true,
    },
    {
      name: 'averageRating',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5,
      admin: { position: 'sidebar', readOnly: true, description: 'Середній рейтинг (оновлюється автоматично)' },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Кількість відгуків' },
    },
    {
      name: 'salesCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Кількість продажів' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Чернетка', value: 'draft' },
        { label: 'Активний', value: 'active' },
        { label: 'В архіві', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
