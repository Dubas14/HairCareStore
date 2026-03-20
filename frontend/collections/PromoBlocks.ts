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
      label: 'Заголовок',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'description',
      label: 'Опис',
      type: 'richText',
      localized: true,
    },
    {
      name: 'image',
      label: 'Зображення',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'buttonText',
      label: 'Текст кнопки',
      type: 'text',
      localized: true,
    },
    {
      name: 'buttonLink',
      label: 'Посилання кнопки',
      type: 'text',
    },
    {
      name: 'backgroundColor',
      label: 'Колір фону',
      type: 'text',
      defaultValue: '#1a1a1a',
      admin: { position: 'sidebar', description: 'HEX колір, наприклад #1a1a1a' },
    },
    {
      name: 'expiresAt',
      label: 'Закінчення акції',
      type: 'date',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'isActive',
      label: 'Активний',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
