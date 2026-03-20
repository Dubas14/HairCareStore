import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  labels: { singular: 'Інгредієнт', plural: 'Інгредієнти' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'benefit', 'icon', 'order'],
    group: 'Каталог',
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
      return collectionAccess('ingredients', 'read')({ req: { user } } as any)
    },
    create: collectionAccess('ingredients', 'create'),
    update: collectionAccess('ingredients', 'update'),
    delete: collectionAccess('ingredients', 'delete'),
  },
  fields: [
    {
      name: 'name',
      label: 'Назва',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: 'напр. Кератин',
      },
    },
    {
      name: 'benefit',
      label: 'Користь',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        placeholder: 'напр. Відновлює структуру волосся',
      },
    },
    {
      name: 'icon',
      label: 'Іконка',
      type: 'select',
      defaultValue: 'sparkles',
      options: [
        { label: 'Краплі (Droplets)', value: 'droplets' },
        { label: 'Блиск (Sparkles)', value: 'sparkles' },
        { label: 'Щит (Shield)', value: 'shield' },
        { label: 'Листок (Leaf)', value: 'leaf' },
      ],
    },
    {
      name: 'order',
      label: 'Порядок',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
