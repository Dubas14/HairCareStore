import type { CollectionConfig } from 'payload'

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
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'buttonText',
      type: 'text',
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
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
