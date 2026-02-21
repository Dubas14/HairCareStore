import type { CollectionConfig } from 'payload'

export const ProductBundles: CollectionConfig = {
  slug: 'product-bundles',
  labels: { singular: 'Набір товарів', plural: 'Набори товарів' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'discountType', 'discountValue', 'isActive'],
    group: 'Маркетинг',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    update: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
  },
  fields: [
    {
      name: 'title',
      label: 'Назва набору',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Опис',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'products',
      label: 'Товари в наборі',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: true,
    },
    {
      name: 'discountType',
      label: 'Тип знижки',
      type: 'select',
      required: true,
      options: [
        { label: 'Відсоток', value: 'percentage' },
        { label: 'Фіксована сума', value: 'fixed' },
      ],
    },
    {
      name: 'discountValue',
      label: 'Значення знижки',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'isActive',
      label: 'Активний',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
