import type { CollectionConfig } from 'payload'

export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Підписник', plural: 'Підписники' },
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
      defaultValue: 'active',
      options: [
        { label: 'Активний', value: 'active' },
        { label: 'Відписаний', value: 'unsubscribed' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      options: [
        { label: 'Українська', value: 'uk' },
        { label: 'English', value: 'en' },
        { label: 'Polski', value: 'pl' },
        { label: 'Deutsch', value: 'de' },
        { label: 'Русский', value: 'ru' },
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
