import type { CollectionConfig, CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const recalcProductRating = async (productId: number | string, payload: any) => {
  try {
    const reviews = await payload.find({
      collection: 'reviews',
      where: {
        product: { equals: productId },
        isApproved: { equals: true },
      },
      limit: 0,
    })
    const count = reviews.totalDocs
    if (count === 0) {
      await payload.update({ collection: 'products', id: productId, data: { averageRating: 0, reviewCount: 0 }, depth: 0 })
      return
    }
    const allReviews = await payload.find({
      collection: 'reviews',
      where: { product: { equals: productId }, isApproved: { equals: true } },
      limit: 500,
    })
    const sum = allReviews.docs.reduce((acc: number, r: any) => acc + (r.rating || 0), 0)
    const avg = Math.round((sum / allReviews.totalDocs) * 10) / 10
    await payload.update({ collection: 'products', id: productId, data: { averageRating: avg, reviewCount: allReviews.totalDocs }, depth: 0 })
  } catch { /* ignore */ }
}

const reviewAfterChange: CollectionAfterChangeHook = async ({ doc, req }) => {
  const productId = typeof doc.product === 'object' && doc.product ? doc.product.id : doc.product
  if (productId) await recalcProductRating(productId, req.payload)
  return doc
}

const reviewAfterDelete: CollectionAfterDeleteHook = async ({ doc, req }) => {
  const productId = typeof doc.product === 'object' && doc.product ? doc.product.id : doc.product
  if (productId) await recalcProductRating(productId, req.payload)
}

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Відгук', plural: 'Відгуки' },
  hooks: {
    afterChange: [reviewAfterChange],
    afterDelete: [reviewAfterDelete],
  },
  admin: {
    useAsTitle: 'customerName',
    defaultColumns: ['customerName', 'rating', 'product', 'isApproved'],
    group: 'Контент',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/custom-list',
        },
        edit: {
          root: {
            Component: '/components/payload/views/custom-edit',
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
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: 'text',
      type: 'textarea',
      required: true,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
    },
    {
      name: 'images',
      label: 'Фото',
      type: 'array',
      maxRows: 5,
      labels: { singular: 'Фото', plural: 'Фото' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      name: 'verifiedPurchase',
      label: 'Підтверджена покупка',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Автоматично встановлюється, якщо клієнт купував цей товар',
      },
    },
    {
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
