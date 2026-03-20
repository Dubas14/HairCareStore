import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'

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
    group: 'Продажі',
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
      if (req.user.collection === 'users') {
        return collectionAccess('customers', 'read')({ req } as any)
      }
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') {
        return collectionAccess('customers', 'update')({ req } as any)
      }
      return { id: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') {
        return collectionAccess('customers', 'delete')({ req } as any)
      }
      return false
    },
  },
  fields: [
    { name: 'firstName', label: "Ім'я", type: 'text', required: true },
    { name: 'lastName', label: 'Прізвище', type: 'text', required: true },
    { name: 'phone', label: 'Телефон', type: 'text' },
    {
      name: 'googleId',
      label: 'Google ID',
      type: 'text',
      index: true,
      admin: { position: 'sidebar', description: 'Google OAuth ID (ідентифікатор)' },
    },
    {
      name: 'authProvider',
      label: 'Провайдер авторизації',
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
      label: 'Email підтверджений',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Чи підтверджений email' },
    },
    {
      name: 'emailVerificationToken',
      label: 'Токен підтвердження',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'emailVerificationExpires',
      label: 'Термін дії токена',
      type: 'date',
      admin: { hidden: true },
    },
    {
      name: 'passwordResetToken',
      label: 'Токен скидання пароля',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'passwordResetExpires',
      label: 'Термін дії токена скидання',
      type: 'date',
      admin: { hidden: true },
    },
    {
      name: 'addresses',
      label: 'Адреси',
      type: 'array',
      maxRows: 5,
      admin: { initCollapsed: true },
      fields: [
        { name: 'firstName', label: "Ім'я", type: 'text', required: true },
        { name: 'lastName', label: 'Прізвище', type: 'text', required: true },
        { name: 'phone', label: 'Телефон', type: 'text' },
        { name: 'city', label: 'Місто', type: 'text', required: true },
        { name: 'address1', label: 'Адреса', type: 'text', required: true, admin: { description: 'Відділення Нової Пошти' } },
        { name: 'countryCode', label: 'Код країни', type: 'text', defaultValue: 'ua' },
        { name: 'postalCode', label: 'Поштовий індекс', type: 'text' },
        { name: 'isDefaultShipping', label: 'Адреса за замовчуванням', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'wishlist',
      label: 'Список бажань',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'metadata',
      label: 'Метадані',
      type: 'json',
    },
  ],
}
