import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Медіафайл', plural: 'Медіа' },
  admin: {
    group: 'Налаштування',
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
    read: ({ req: { user } }) => {
      if (!user) return true
      return collectionAccess('media', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('media', 'create'),
    update: collectionAccess('media', 'update'),
    delete: collectionAccess('media', 'delete'),
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
