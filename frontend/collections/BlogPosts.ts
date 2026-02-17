import type { CollectionConfig } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: { singular: 'Стаття', plural: 'Блог' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
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
      name: 'excerpt',
      type: 'textarea',
      maxLength: 300,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Чернетка', value: 'draft' },
        { label: 'Опублікований', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
