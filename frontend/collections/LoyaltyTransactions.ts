import type { CollectionConfig } from 'payload'

export const LoyaltyTransactions: CollectionConfig = {
  slug: 'loyalty-transactions',
  labels: { singular: 'Транзакція', plural: 'Транзакції лояльності' },
  admin: {
    defaultColumns: ['customer', 'transactionType', 'pointsAmount', 'createdAt'],
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
  },
  fields: [
    { name: 'customer', label: 'Клієнт', type: 'relationship', relationTo: 'customers', required: true, index: true },
    {
      name: 'transactionType',
      label: 'Тип транзакції',
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
    { name: 'pointsAmount', label: 'Кількість балів', type: 'number', required: true },
    { name: 'orderId', label: 'ID замовлення', type: 'text' },
    { name: 'description', label: 'Опис', type: 'text' },
    { name: 'balanceAfter', label: 'Баланс після', type: 'number', required: true },
  ],
}
