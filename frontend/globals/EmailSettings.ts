import type { GlobalConfig } from 'payload'

export const EmailSettings: GlobalConfig = {
  slug: 'email-settings',
  label: 'Налаштування email',
  admin: {
    group: 'Налаштування',
    components: {
      views: {
        edit: {
          root: { Component: '/components/payload/email/EmailSettingsView' },
        },
      },
    },
  },
  access: {
    read: () => true,
    update: ({ req }) => req?.user?.collection === 'users',
  },
  fields: [
    // Global toggle
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      label: 'Email-розсилки активні',
    },

    // Email types group
    {
      name: 'emailTypes',
      type: 'group',
      label: 'Типи листів',
      fields: [
        { name: 'orderConfirmation', type: 'checkbox', defaultValue: true, label: 'Підтвердження замовлення' },
        { name: 'welcome', type: 'checkbox', defaultValue: true, label: 'Вітальний лист' },
        { name: 'shippingNotification', type: 'checkbox', defaultValue: true, label: 'Відправка замовлення' },
        { name: 'reviewRequest', type: 'checkbox', defaultValue: true, label: 'Запит на відгук' },
        { name: 'abandonedCart', type: 'checkbox', defaultValue: true, label: 'Покинутий кошик' },
        { name: 'priceDrop', type: 'checkbox', defaultValue: true, label: 'Зниження ціни' },
        { name: 'backInStock', type: 'checkbox', defaultValue: true, label: 'Знову в наявності' },
        { name: 'loyaltyLevelUp', type: 'checkbox', defaultValue: true, label: 'Підвищення рівня лояльності' },
        { name: 'newsletterConfirmation', type: 'checkbox', defaultValue: true, label: 'Підтвердження підписки' },
      ],
    },

    // Abandoned cart config group
    {
      name: 'abandonedCartConfig',
      type: 'group',
      label: 'Таймінг покинутого кошика',
      fields: [
        { name: 'firstEmailHours', type: 'number', defaultValue: 1, label: 'Перший лист (годин)', admin: { description: 'Через скільки годин після покинутого кошика надіслати 1-й лист' } },
        { name: 'secondEmailHours', type: 'number', defaultValue: 24, label: 'Другий лист (годин)', admin: { description: 'Через скільки годин надіслати 2-й лист' } },
        { name: 'thirdEmailHours', type: 'number', defaultValue: 72, label: 'Третій лист (годин)', admin: { description: 'Через скільки годин надіслати 3-й лист' } },
      ],
    },

    // Stats group (read-only)
    {
      name: 'stats',
      type: 'group',
      label: 'Статистика',
      admin: {
        readOnly: true,
      },
      fields: [
        { name: 'totalSent', type: 'number', defaultValue: 0, label: 'Всього відправлено' },
        { name: 'lastSentAt', type: 'date', label: 'Останній відправлений', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
  ],
}
