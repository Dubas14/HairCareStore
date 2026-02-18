import type { CollectionConfig } from 'payload'

export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: { singular: 'Банер', plural: 'Банери' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'position', 'order', 'isActive'],
    group: 'Контент',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/banners/BannersListView',
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
    create: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    update: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'link',
      type: 'text',
    },
    {
      name: 'position',
      type: 'select',
      required: true,
      defaultValue: 'home',
      options: [
        { label: 'Головна', value: 'home' },
        { label: 'Категорія', value: 'category' },
        { label: 'Промо', value: 'promo' },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'mediaType',
      type: 'select',
      options: [
        { label: 'Зображення', value: 'image' },
        { label: 'Відео', value: 'video' },
      ],
      defaultValue: 'image',
    },
  ],
}
