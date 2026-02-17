import type { GlobalConfig } from 'payload'

export const ShippingConfig: GlobalConfig = {
  slug: 'shipping-config',
  label: 'Доставка',
  admin: {
    group: 'Магазин',
  },
  access: {
    read: () => true,
    update: ({ req }) => req?.user?.collection === 'users',
  },
  fields: [
    {
      name: 'methods',
      type: 'array',
      fields: [
        { name: 'methodId', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true, min: 0 },
        { name: 'freeAbove', type: 'number', min: 0, admin: { description: 'Free shipping above this amount (UAH)' } },
        { name: 'isActive', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
