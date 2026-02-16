import type { CollectionConfig } from 'payload'

export const LoyaltyTransactions: CollectionConfig = {
  slug: 'loyalty-transactions',
  admin: {
    defaultColumns: ['customer', 'transactionType', 'pointsAmount', 'createdAt'],
    group: 'Loyalty',
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
        { label: 'Earned', value: 'earned' },
        { label: 'Spent', value: 'spent' },
        { label: 'Expired', value: 'expired' },
        { label: 'Welcome', value: 'welcome' },
        { label: 'Referral', value: 'referral' },
        { label: 'Adjustment', value: 'adjustment' },
      ],
    },
    { name: 'pointsAmount', type: 'number', required: true },
    { name: 'orderId', type: 'text' },
    { name: 'description', type: 'text' },
    { name: 'balanceAfter', type: 'number', required: true },
  ],
}
