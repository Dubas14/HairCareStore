import type { CollectionConfig } from 'payload'

const addressFields = [
  { name: 'firstName', type: 'text' as const },
  { name: 'lastName', type: 'text' as const },
  { name: 'phone', type: 'text' as const },
  { name: 'city', type: 'text' as const },
  { name: 'address1', type: 'text' as const },
  { name: 'countryCode', type: 'text' as const, defaultValue: 'ua' },
  { name: 'postalCode', type: 'text' as const },
]

export const Carts: CollectionConfig = {
  slug: 'carts',
  labels: { singular: 'Кошик', plural: 'Кошики' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'total', 'updatedAt'],
    group: 'Магазин',
    hidden: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    { name: 'customer', type: 'relationship', relationTo: 'customers' },
    { name: 'email', type: 'email' },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products', required: true },
        { name: 'variantIndex', type: 'number', required: true },
        { name: 'variantTitle', type: 'text' },
        { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1 },
        { name: 'unitPrice', type: 'number', required: true, min: 0 },
        { name: 'productTitle', type: 'text' },
        { name: 'productThumbnail', type: 'text' },
      ],
    },
    { name: 'shippingAddress', type: 'group', fields: addressFields },
    { name: 'billingAddress', type: 'group', fields: addressFields },
    { name: 'shippingMethod', type: 'text' },
    { name: 'shippingTotal', type: 'number', defaultValue: 0 },
    { name: 'subtotal', type: 'number', defaultValue: 0 },
    { name: 'discountTotal', type: 'number', defaultValue: 0 },
    { name: 'loyaltyPointsUsed', type: 'number', defaultValue: 0 },
    { name: 'loyaltyDiscount', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Активний', value: 'active' },
        { label: 'Завершений', value: 'completed' },
        { label: 'Покинутий', value: 'abandoned' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'completedAt', type: 'date' },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.items && Array.isArray(data.items)) {
          const subtotal = data.items.reduce(
            (sum: number, item: { unitPrice?: number; quantity?: number }) =>
              sum + (item.unitPrice || 0) * (item.quantity || 0),
            0,
          )
          data.subtotal = subtotal
          data.total = subtotal + (data.shippingTotal || 0) - (data.discountTotal || 0) - (data.loyaltyDiscount || 0)
        }
        return data
      },
    ],
  },
}
