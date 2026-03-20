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
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'status',
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
      type: 'text',
      admin: { hidden: true },
      index: true,
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'Українська', value: 'uk' },
      ],
      defaultValue: 'uk',
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Форма на сайті', value: 'website' },
        { label: 'Checkout', value: 'checkout' },
        { label: 'Імпорт', value: 'import' },
      ],
      defaultValue: 'website',
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: false,
    },
  ],
  timestamps: true,
}
