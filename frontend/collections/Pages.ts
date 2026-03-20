import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Сторінка', plural: 'Сторінки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'isPublished'],
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
      return collectionAccess('pages', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('pages', 'create'),
    update: collectionAccess('pages', 'update'),
    delete: collectionAccess('pages', 'delete'),
  },
  fields: [
    {
      name: 'title',
      label: 'Заголовок',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'URL (slug)',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isPublished',
      label: 'Опублікована',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Контент',
          fields: [
            {
              name: 'content',
              label: 'Контент',
              type: 'richText',
              localized: true,
            },
            {
              name: 'featuredImage',
              label: 'Головне зображення',
              type: 'upload',
              relationTo: 'media',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'metaTitle',
              label: 'SEO заголовок',
              type: 'text',
            },
            {
              name: 'metaDescription',
              label: 'SEO опис',
              type: 'textarea',
            },
          ],
        },
      ],
    },
  ],
}
