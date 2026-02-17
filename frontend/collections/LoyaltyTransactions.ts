import type { CollectionConfig } from 'payload'

export const LoyaltyTransactions: CollectionConfig = {
  slug: 'loyalty-transactions',
  labels: { singular: 'Транзакція', plural: 'Транзакції лояльності' },
  admin: {
    defaultColumns: ['customer', 'transactionType', 'pointsAmount', 'createdAt'],
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
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers', required: true, index: true },
    {
      name: 'transactionType',
      type: 'select',
      required: true,
      options: [
        { label: 'Нараховано', value: 'earned' },
        { label: 'Списано', value: 'spent' },
        { label: 'Протерміновано', value: 'expired' },
        { label: 'Вітальний бонус', value: 'welcome' },
        { label: 'Реферал', value: 'referral' },
        { label: 'Коригування', value: 'adjustment' },
      ],
    },
    { name: 'pointsAmount', type: 'number', required: true },
    { name: 'orderId', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'balanceAfter', type: 'number', required: true },
  ],
}
