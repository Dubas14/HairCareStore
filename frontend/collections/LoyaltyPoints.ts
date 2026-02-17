import type { CollectionConfig } from 'payload'

export const LoyaltyPoints: CollectionConfig = {
  slug: 'loyalty-points',
  labels: { singular: 'Бали лояльності', plural: 'Бали лояльності' },
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'pointsBalance', 'level', 'isEnabled'],
    group: 'Лояльність',
    hidden: true,
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { customer: { equals: req.user.id } }
    },
    create: ({ req }) => req?.user?.collection === 'users',
    update: ({ req }) => req?.user?.collection === 'users',
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true, unique: true },
    { name: 'pointsBalance', type: 'number', defaultValue: 0 },
    { name: 'totalEarned', type: 'number', defaultValue: 0 },
    { name: 'totalSpent', type: 'number', defaultValue: 0 },
    {
      name: 'level',
      type: 'select',
      defaultValue: 'bronze',
      options: [
        { label: 'Бронза', value: 'bronze' },
        { label: 'Срібло', value: 'silver' },
        { label: 'Золото', value: 'gold' },
      ],
    },
    { name: 'referralCode', type: 'text', unique: true },
    { name: 'referredBy', type: 'text' },
    { name: 'isEnabled', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
