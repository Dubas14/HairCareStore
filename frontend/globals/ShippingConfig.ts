import type { GlobalConfig } from 'payload'

export const ShippingConfig: GlobalConfig = {
  slug: 'shipping-config',
  label: 'Доставка',
  admin: {
    group: 'Налаштування',
  },
  access: {
    read: () => true,
    update: ({ req }) => req?.user?.collection === 'users',
  },
  fields: [
    {
      name: 'zones',
      label: 'Зони доставки',
      type: 'array',
      labels: { singular: 'Зона', plural: 'Зони' },
      fields: [
        { name: 'name', label: 'Назва зони', type: 'text', required: true },
        { name: 'isActive', label: 'Активна', type: 'checkbox', defaultValue: true },
        {
          name: 'countries',
          label: 'Країни',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Україна', value: 'UA' },
            { label: 'Польща', value: 'PL' },
            { label: 'Німеччина', value: 'DE' },
            { label: 'Франція', value: 'FR' },
            { label: 'Італія', value: 'IT' },
            { label: 'Іспанія', value: 'ES' },
            { label: 'Чехія', value: 'CZ' },
            { label: 'Словаччина', value: 'SK' },
            { label: 'Румунія', value: 'RO' },
            { label: 'Угорщина', value: 'HU' },
            { label: 'Литва', value: 'LT' },
            { label: 'Латвія', value: 'LV' },
            { label: 'Естонія', value: 'EE' },
            { label: 'Болгарія', value: 'BG' },
            { label: 'Австрія', value: 'AT' },
            { label: 'Великобританія', value: 'GB' },
          ],
        },
        {
          name: 'methods',
          label: 'Методи доставки',
          type: 'array',
          labels: { singular: 'Метод', plural: 'Методи' },
          fields: [
            { name: 'carrier', label: 'Перевізник', type: 'text', required: true },
            { name: 'name', label: 'Назва', type: 'text', required: true },
            { name: 'price', label: 'Ціна', type: 'number', required: true, min: 0 },
            {
              name: 'currency',
              label: 'Валюта',
              type: 'select',
              defaultValue: 'UAH',
              options: [
                { label: 'UAH (₴)', value: 'UAH' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'PLN (zł)', value: 'PLN' },
                { label: 'USD ($)', value: 'USD' },
              ],
            },
            { name: 'freeAbove', label: 'Безкоштовно від', type: 'number', min: 0, admin: { description: 'Безкоштовна доставка від цієї суми' } },
            { name: 'estimatedDays', label: 'Орієнтовна доставка (днів)', type: 'number', min: 1 },
            { name: 'isActive', label: 'Активний', type: 'checkbox', defaultValue: true },
          ],
        },
      ],
    },
    {
      name: 'methods',
      label: 'Методи доставки (загальні)',
      type: 'array',
      admin: { description: 'Загальний список методів (для зворотної сумісності)' },
      fields: [
        { name: 'methodId', type: 'text', required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'price', type: 'number', required: true, min: 0 },
        { name: 'freeAbove', type: 'number', min: 0, admin: { description: 'Free shipping above this amount' } },
        { name: 'isActive', type: 'checkbox', defaultValue: true },
      ],
    },
  ],
}
