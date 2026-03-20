import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

export const PromoBlocks: CollectionConfig = {
  slug: 'promo-blocks',
  labels: { singular: 'Промо-блок', plural: 'Промо-блоки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'isActive'],
    group: 'Контент',
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
      return collectionAccess('promo-blocks', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('promo-blocks', 'create'),
    update: collectionAccess('promo-blocks', 'update'),
    delete: collectionAccess('promo-blocks', 'delete'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'buttonText',
      type: 'text',
      localized: true,
    },
    {
      name: 'buttonLink',
      type: 'text',
    },
    {
      name: 'backgroundColor',
      type: 'text',
      defaultValue: '#1a1a1a',
    },
    {
      name: 'expiresAt',
      label: 'Закінчення акції',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
