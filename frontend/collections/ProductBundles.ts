import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

export const ProductBundles: CollectionConfig = {
  slug: 'product-bundles',
  labels: { singular: 'Набір товарів', plural: 'Набори товарів' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'discountType', 'discountValue', 'isActive'],
    group: 'Маркетинг',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/custom-list',
        },
        edit: {
          root: {
            Component: '/components/payload/views/custom-edit',
          },
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return true
      return collectionAccess('product-bundles', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('product-bundles', 'create'),
    update: collectionAccess('product-bundles', 'update'),
    delete: collectionAccess('product-bundles', 'delete'),
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
