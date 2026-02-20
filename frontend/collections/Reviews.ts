import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  labels: { singular: 'Відгук', plural: 'Відгуки' },
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
