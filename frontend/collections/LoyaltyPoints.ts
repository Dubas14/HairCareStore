import type { CollectionConfig } from 'payload'

export const LoyaltyPoints: CollectionConfig = {
  slug: 'loyalty-points',
  admin: {
    useAsTitle: 'customer',
    defaultColumns: ['customer', 'pointsBalance', 'level', 'isEnabled'],
    group: 'Loyalty',
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
        { label: 'Bronze', value: 'bronze' },
        { label: 'Silver', value: 'silver' },
        { label: 'Gold', value: 'gold' },
      ],
    },
    { name: 'referralCode', type: 'text', unique: true },
    { name: 'referredBy', type: 'text' },
    { name: 'isEnabled', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
