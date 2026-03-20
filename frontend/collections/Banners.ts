import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

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
    read: ({ req: { user } }) => {
      if (!user) return true
      return collectionAccess('banners', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('banners', 'create'),
    update: collectionAccess('banners', 'update'),
    delete: collectionAccess('banners', 'delete'),
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
      name: 'image',
      label: 'Зображення',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'link',
      label: 'Посилання',
      type: 'text',
      admin: { description: 'URL куди веде банер при кліку' },
    },
    {
      name: 'position',
      label: 'Позиція',
      type: 'select',
      required: true,
      defaultValue: 'home',
      options: [
        { label: 'Головна', value: 'home' },
        { label: 'Категорія', value: 'category' },
        { label: 'Промо', value: 'promo' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'isActive',
      label: 'Активний',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'mediaType',
      label: 'Тип медіа',
      type: 'select',
      options: [
        { label: 'Зображення', value: 'image' },
        { label: 'Відео', value: 'video' },
      ],
      defaultValue: 'image',
      admin: { position: 'sidebar' },
    },
  ],
}
