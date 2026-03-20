import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Підписник', plural: 'Підписники' },
  access: {
    read: collectionAccess('subscribers', 'read'),
    create: ({ req: { user } }) => {
      // Public create (newsletter subscription)
      if (!user) return true
      if (user.collection !== 'users') return true
      return collectionAccess('subscribers', 'create')({ req: { user } } as any)
    },
    update: collectionAccess('subscribers', 'update'),
    delete: collectionAccess('subscribers', 'delete'),
  },
  admin: {
    group: 'Маркетинг',
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'locale', 'createdAt'],
    components: {
      views: {
        list: { Component: '/components/payload/views/custom-list' },
        edit: { root: { Component: '/components/payload/views/custom-edit' } },
      },
    },
  },
  fields: [
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'firstName',
      label: "Ім'я",
      type: 'text',
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Очікує підтвердження', value: 'pending' },
        { label: 'Активний', value: 'active' },
        { label: 'Відписаний', value: 'unsubscribed' },
      ],
    },
    {
      name: 'confirmToken',
      label: 'Токен підтвердження',
      type: 'text',
      admin: { hidden: true },
      index: true,
    },
    {
      name: 'locale',
      label: 'Мова',
      type: 'select',
      options: [
        { label: 'Українська', value: 'uk' },
      ],
      defaultValue: 'uk',
    },
    {
      name: 'source',
      label: 'Джерело',
      type: 'select',
      options: [
        { label: 'Форма на сайті', value: 'website' },
        { label: 'Оформлення замовлення', value: 'checkout' },
        { label: 'Імпорт', value: 'import' },
      ],
      defaultValue: 'website',
    },
    {
      name: 'customer',
      label: 'Клієнт',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: false,
    },
  ],
  timestamps: true,
}
