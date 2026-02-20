import type { CollectionConfig } from 'payload'

export const PromotionUsages: CollectionConfig = {
  slug: 'promotion-usages',
  labels: { singular: 'Використання промокоду', plural: 'Використання промокодів' },
  admin: {
    defaultColumns: ['promotion', 'email', 'orderId', 'discountAmount', 'createdAt'],
    group: 'Маркетинг',
    hidden: true,
  },
  access: {
    read: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    create: () => true,
    update: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
  },
  fields: [
    {
      name: 'promotion',
      label: 'Промокод',
      type: 'relationship',
      relationTo: 'promotions',
      required: true,
      index: true,
    },
    {
      name: 'customer',
      label: 'Клієнт',
      type: 'relationship',
      relationTo: 'customers',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'orderId',
      label: 'Замовлення',
      type: 'number',
    },
    {
      name: 'discountAmount',
      label: 'Сума знижки',
      type: 'number',
      required: true,
    },
    {
      name: 'currency',
      label: 'Валюта',
      type: 'text',
      defaultValue: 'UAH',
    },
  ],
}
