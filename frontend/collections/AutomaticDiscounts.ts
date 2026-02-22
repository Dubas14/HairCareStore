import type { CollectionConfig } from 'payload'

export const AutomaticDiscounts: CollectionConfig = {
  slug: 'automatic-discounts',
  labels: { singular: 'Автоматична знижка', plural: 'Автоматичні знижки' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'value', 'priority', 'isActive', 'expiresAt'],
    group: 'Маркетинг',
    components: {
      views: {
        list: { Component: '/components/payload/views/custom-list' },
        edit: { root: { Component: '/components/payload/views/custom-edit' } },
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
      name: 'title',
      label: 'Назва',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'type',
      label: 'Тип знижки',
      type: 'select',
      required: true,
      options: [
        { label: 'Відсоток', value: 'percentage' },
        { label: 'Фіксована сума', value: 'fixed' },
      ],
    },
    {
      name: 'value',
      label: 'Значення',
      type: 'number',
      required: true,
      min: 0,
      admin: { description: 'Відсоток (наприклад 10) або сума у валюті' },
    },
    {
      name: 'conditions',
      label: 'Умови застосування',
      type: 'group',
      fields: [
        {
          name: 'minItems',
          label: 'Мінімальна кількість товарів',
          type: 'number',
          min: 0,
        },
        {
          name: 'minOrderAmount',
          label: 'Мінімальна сума замовлення',
          type: 'number',
          min: 0,
        },
        {
          name: 'requiredProducts',
          label: 'Необхідні товари',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
        },
        {
          name: 'requiredCategories',
          label: 'Необхідні категорії',
          type: 'relationship',
          relationTo: 'categories',
          hasMany: true,
        },
      ],
    },
    {
      name: 'priority',
      label: 'Пріоритет',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Вищий пріоритет — застосовується першим' },
    },
    {
      name: 'stackable',
      label: 'Можна поєднувати',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Чи можна поєднувати з іншими знижками' },
    },
    {
      name: 'startsAt',
      label: 'Початок дії',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'expiresAt',
      label: 'Закінчення дії',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'isActive',
      label: 'Активна',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
}
