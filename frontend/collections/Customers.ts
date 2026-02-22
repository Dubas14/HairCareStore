import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  labels: { singular: 'Клієнт', plural: 'Клієнти' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'createdAt'],
    group: 'Магазин',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/custom-list',
        },
        edit: {
          root: {
            Component: '/components/payload/views/customers/CustomerEditView',
          },
        },
      },
    },
  },
  access: {
    create: () => true, // Public registration
    read: ({ req }) => {
      if (!req.user) return false
      // Admin users (from 'users' collection) can read all
      if (req.user.collection === 'users') return true
      // Customers can only read themselves
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { id: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return req.user.collection === 'users'
    },
  },
  fields: [
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'phone', type: 'text' },
    {
      name: 'googleId',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'Google OAuth ID' },
    },
    {
      name: 'authProvider',
      type: 'select',
      defaultValue: 'local',
      options: [
        { label: 'Email/Пароль', value: 'local' },
        { label: 'Google', value: 'google' },
      ],
      admin: { position: 'sidebar', description: 'Спосіб авторизації' },
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Чи підтверджений email' },
    },
    {
      name: 'emailVerificationToken',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'emailVerificationExpires',
      type: 'date',
      admin: { hidden: true },
    },
    {
      name: 'addresses',
      type: 'array',
      maxRows: 5,
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text', required: true },
        { name: 'phone', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'address1', type: 'text', required: true, admin: { description: 'Nova Poshta warehouse' } },
        { name: 'countryCode', type: 'text', defaultValue: 'ua' },
        { name: 'postalCode', type: 'text' },
        { name: 'isDefaultShipping', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'wishlist',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
}
