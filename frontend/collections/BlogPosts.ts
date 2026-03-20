import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

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
    read: ({ req: { user } }) => {
      if (!user) return true
      return collectionAccess('blog-posts', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('blog-posts', 'create'),
    update: collectionAccess('blog-posts', 'update'),
    delete: collectionAccess('blog-posts', 'delete'),
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
      name: 'status',
      label: 'Статус',
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
    {
      name: 'publishedAt',
      label: 'Дата публікації',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
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
              name: 'excerpt',
              label: 'Короткий опис',
              type: 'textarea',
              maxLength: 300,
              localized: true,
            },
          ],
        },
        {
          label: 'Медіа та автор',
          fields: [
            {
              name: 'featuredImage',
              label: 'Головне зображення',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'author',
              label: 'Автор',
              type: 'text',
            },
          ],
        },
        {
          label: 'Теги',
          fields: [
            {
              name: 'tags',
              label: 'Теги',
              type: 'array',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'tag',
                  label: 'Тег',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
