import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медіафайл', plural: 'Медіа' },
  admin: {
    group: 'Система',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/media/MediaLibraryView',
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
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 600,
        height: 400,
        position: 'centre',
      },
      {
        name: 'feature',
        width: 1200,
        height: 800,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'folder',
      type: 'select',
      options: [
        { label: 'Товари', value: 'products' },
        { label: 'Банери', value: 'banners' },
        { label: 'Бренди', value: 'brands' },
        { label: 'Категорії', value: 'categories' },
        { label: 'Блог', value: 'blog' },
        { label: 'Інше', value: 'other' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
}
