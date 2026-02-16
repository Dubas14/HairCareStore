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

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'displayId',
    defaultColumns: ['displayId', 'email', 'status', 'total', 'createdAt'],
    group: 'Shop',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { customer: { equals: req.user.id } }
    },
    create: () => true,
    update: ({ req }) => {
      if (!req.user) return false
      return req.user.collection === 'users'
    },
  },
  fields: [
    { name: 'displayId', type: 'number', admin: { readOnly: true } },
    { name: 'customer', type: 'relationship', relationTo: 'customers' },
    { name: 'email', type: 'email', required: true },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Requires Action', value: 'requires_action' },
        { label: 'Archived', value: 'archived' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'awaiting',
      options: [
        { label: 'Awaiting', value: 'awaiting' },
        { label: 'Paid', value: 'paid' },
        { label: 'Refunded', value: 'refunded' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'fulfillmentStatus',
      type: 'select',
      defaultValue: 'not_fulfilled',
      options: [
        { label: 'Not Fulfilled', value: 'not_fulfilled' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'productId', type: 'number' },
        { name: 'productTitle', type: 'text', required: true },
        { name: 'variantTitle', type: 'text' },
        { name: 'quantity', type: 'number', required: true },
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'subtotal', type: 'number', required: true },
        { name: 'thumbnail', type: 'text' },
      ],
    },
    { name: 'shippingAddress', type: 'group', fields: addressFields },
    { name: 'billingAddress', type: 'group', fields: addressFields },
    { name: 'paymentMethod', type: 'text', defaultValue: 'cod' },
    { name: 'shippingMethod', type: 'text' },
    { name: 'subtotal', type: 'number', required: true },
    { name: 'shippingTotal', type: 'number', defaultValue: 0 },
    { name: 'discountTotal', type: 'number', defaultValue: 0 },
    { name: 'loyaltyPointsUsed', type: 'number', defaultValue: 0 },
    { name: 'loyaltyDiscount', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true },
    { name: 'cartId', type: 'text' },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && !data?.displayId) {
          const payload = req.payload
          const lastOrder = await payload.find({
            collection: 'orders',
            sort: '-displayId',
            limit: 1,
          })
          data!.displayId = (lastOrder.docs[0]?.displayId || 0) + 1
        }
        return data
      },
    ],
  },
}
