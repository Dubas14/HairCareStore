import type { GlobalConfig } from 'payload'

export const InventorySettings: GlobalConfig = {
  slug: 'inventory-settings',
  label: 'Налаштування складу',
  admin: {
    group: 'Налаштування',
  },
  access: {
    read: () => true,
    update: ({ req }) => req?.user?.collection === 'users',
  },
  fields: [
    {
      name: 'lowStockThreshold',
      label: 'Поріг низького запасу',
      type: 'number',
      defaultValue: 5,
      min: 0,
      admin: { description: 'Кількість одиниць, при якій товар вважається з низьким запасом' },
    },
    {
      name: 'outOfStockBehavior',
      label: 'Поведінка при відсутності товару',
      type: 'select',
      defaultValue: 'show_unavailable',
      options: [
        { label: 'Приховати', value: 'hide' },
        { label: 'Показати як недоступний', value: 'show_unavailable' },
      ],
    },
    {
      name: 'backInStockNotifications',
      label: 'Сповіщення "Знову в наявності"',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Дозволити клієнтам підписуватися на сповіщення про повернення товару' },
    },
  ],
}
