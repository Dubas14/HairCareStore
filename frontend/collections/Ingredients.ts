import type { CollectionConfig } from 'payload'

export const Ingredients: CollectionConfig = {
  slug: 'ingredients',
  labels: { singular: 'Інгредієнт', plural: 'Інгредієнти' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'benefit', 'icon', 'order'],
    group: 'Магазин',
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
    create: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    update: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
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
