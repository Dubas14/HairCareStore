import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Адміністратор', plural: 'Адміністратори' },
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Система',
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
  ],
}
