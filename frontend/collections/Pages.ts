import type { CollectionConfig } from 'payload'

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
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'metaTitle',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
