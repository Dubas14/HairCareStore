import type { CollectionConfig } from 'payload'

export const LoyaltyPoints: CollectionConfig = {
  slug: 'loyalty-points',
  labels: { singular: 'Бали лояльності', plural: 'Бали лояльності' },
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'pointsBalance', 'level', 'isEnabled'],
    group: 'Продажі',
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
    { name: 'customer', label: 'Клієнт', type: 'relationship', relationTo: 'customers', required: true, unique: true },
    { name: 'pointsBalance', label: 'Баланс балів', type: 'number', defaultValue: 0 },
    { name: 'totalEarned', label: 'Всього нараховано', type: 'number', defaultValue: 0 },
    { name: 'totalSpent', label: 'Всього витрачено', type: 'number', defaultValue: 0 },
    {
      name: 'level',
      label: 'Рівень',
      type: 'select',
      defaultValue: 'bronze',
      options: [
        { label: 'Бронза', value: 'bronze' },
        { label: 'Срібло', value: 'silver' },
        { label: 'Золото', value: 'gold' },
      ],
    },
    { name: 'referralCode', label: 'Реферальний код', type: 'text', unique: true },
    { name: 'referredBy', label: 'Запрошений', type: 'text' },
    { name: 'isEnabled', label: 'Активний', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
