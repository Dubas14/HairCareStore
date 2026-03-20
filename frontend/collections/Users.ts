import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Адміністратор', plural: 'Адміністратори' },
  auth: {
    maxLoginAttempts: 5,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Налаштування',
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
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Адмін', value: 'admin' },
        { label: 'Редактор', value: 'editor' },
      ],
      defaultValue: 'editor',
    },
    {
      name: 'permissions',
      type: 'json',
      label: 'Дозволи',
      admin: {
        description: 'CRUD-дозволи по колекціях. Налаштовуються тільки для ролі "Редактор". Адмін завжди має повний доступ.',
        condition: (data: Record<string, unknown>) => data?.role === 'editor',
        components: {
          Field: '/components/payload/PermissionsEditor',
        },
      },
      defaultValue: {
        products: { read: true, create: true, update: true, delete: false },
        categories: { read: true, create: true, update: true, delete: false },
        brands: { read: true, create: true, update: true, delete: false },
        ingredients: { read: true, create: true, update: true, delete: false },
        orders: { read: true, create: false, update: true, delete: false },
        customers: { read: true, create: false, update: false, delete: false },
        promotions: { read: true, create: true, update: true, delete: true },
        'automatic-discounts': { read: true, create: true, update: true, delete: true },
        'product-bundles': { read: true, create: true, update: true, delete: true },
        subscribers: { read: true, create: false, update: true, delete: false },
        banners: { read: true, create: true, update: true, delete: true },
        'promo-blocks': { read: true, create: true, update: true, delete: true },
        pages: { read: true, create: true, update: true, delete: true },
        'blog-posts': { read: true, create: true, update: true, delete: true },
        reviews: { read: true, create: false, update: true, delete: true },
        media: { read: true, create: true, update: true, delete: false },
        'site-settings': { read: false, update: false },
        'shipping-config': { read: false, update: false },
        'email-settings': { read: false, update: false },
        'inventory-settings': { read: false, update: false },
        'loyalty-settings': { read: false, update: false },
      },
    },
  ],
}
