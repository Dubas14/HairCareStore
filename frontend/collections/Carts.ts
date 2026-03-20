import type { CollectionConfig } from 'payload'

const addressFields = [
  { name: 'firstName', label: "Ім'я", type: 'text' as const },
  { name: 'lastName', label: 'Прізвище', type: 'text' as const },
  { name: 'phone', label: 'Телефон', type: 'text' as const },
  { name: 'city', label: 'Місто', type: 'text' as const },
  { name: 'address1', label: 'Адреса', type: 'text' as const },
  { name: 'countryCode', label: 'Код країни', type: 'text' as const, defaultValue: 'ua' },
  { name: 'postalCode', label: 'Поштовий індекс', type: 'text' as const },
]

export const Carts: CollectionConfig = {
  slug: 'carts',
  labels: { singular: 'Кошик', plural: 'Кошики' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'status', 'total', 'updatedAt'],
    group: 'Продажі',
    hidden: true,
  },
  access: {
    read: ({ req }) => {
      if (req?.user && req.user.collection === 'users') return true
      return false
    },
    create: () => true,
    update: ({ req }) => {
      if (req?.user && req.user.collection === 'users') return true
      return false
    },
    delete: ({ req }) => Boolean(req?.user && req.user.collection === 'users'),
  },
  fields: [
    { name: 'customer', label: 'Клієнт', type: 'relationship', relationTo: 'customers' },
    { name: 'email', label: 'Email', type: 'email' },
    {
      name: 'items',
      label: 'Товари',
      type: 'array',
      fields: [
        { name: 'product', label: 'Товар', type: 'relationship', relationTo: 'products', required: true },
        { name: 'variantIndex', label: 'Індекс варіанту', type: 'number', required: true },
        { name: 'variantTitle', label: 'Назва варіанту', type: 'text' },
        { name: 'quantity', label: 'Кількість', type: 'number', required: true, min: 1, defaultValue: 1 },
        { name: 'unitPrice', label: 'Ціна за одиницю', type: 'number', required: true, min: 0 },
        { name: 'productTitle', label: 'Назва товару', type: 'text' },
        { name: 'productThumbnail', label: 'Мініатюра', type: 'text' },
      ],
    },
    { name: 'shippingAddress', label: 'Адреса доставки', type: 'group', fields: addressFields },
    { name: 'billingAddress', label: 'Адреса оплати', type: 'group', fields: addressFields },
    { name: 'shippingMethod', label: 'Спосіб доставки', type: 'text' },
    { name: 'shippingTotal', label: 'Вартість доставки', type: 'number', defaultValue: 0 },
    { name: 'subtotal', label: 'Підсумок', type: 'number', defaultValue: 0 },
    { name: 'discountTotal', label: 'Знижка', type: 'number', defaultValue: 0 },
    { name: 'loyaltyPointsUsed', label: 'Використано балів', type: 'number', defaultValue: 0 },
    { name: 'loyaltyDiscount', label: 'Знижка за бали', type: 'number', defaultValue: 0 },
    { name: 'total', label: 'Загальна сума', type: 'number', defaultValue: 0 },
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
    { name: 'paymentMethod', label: 'Спосіб оплати', type: 'text' },
    { name: 'stripePaymentIntentId', label: 'Stripe Payment Intent', type: 'text' },
    { name: 'stripeClientSecret', label: 'Stripe Client Secret', type: 'text' },
    { name: 'promoCode', label: 'Промокод', type: 'text', admin: { description: 'Застосований промокод' } },
    { name: 'promoDiscount', label: 'Знижка промокоду', type: 'number', defaultValue: 0, admin: { description: 'Сума знижки за промокодом' } },
    {
      name: 'appliedDiscounts',
      label: 'Застосовані знижки',
      type: 'json',
      admin: { description: 'Деталі автоматичних знижок (заповнюється автоматично)' },
    },
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Активний', value: 'active' },
        { label: 'Завершений', value: 'completed' },
        { label: 'Покинутий', value: 'abandoned' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'completedAt', label: 'Дата завершення', type: 'date' },
    { name: 'abandonedEmailsSent', label: 'Відправлено листів', type: 'number', defaultValue: 0, admin: { description: 'Кількість надісланих листів про покинутий кошик' } },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.items && Array.isArray(data.items)) {
          const subtotal = data.items.reduce(
            (sum: number, item: { unitPrice?: number; quantity?: number }) =>
              sum + (item.unitPrice || 0) * (item.quantity || 0),
            0,
          )
          data.subtotal = subtotal
          data.total = subtotal + (data.shippingTotal || 0) - (data.discountTotal || 0) - (data.loyaltyDiscount || 0) - (data.promoDiscount || 0)
        }
        return data
      },
    ],
  },
}
