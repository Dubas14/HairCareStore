import type { CollectionConfig } from 'payload'
import { createLogger } from '@/lib/logger'

const log = createLogger('orders')

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Замовлення', plural: 'Замовлення' },
  admin: {
    useAsTitle: 'displayId',
    defaultColumns: ['displayId', 'email', 'status', 'total', 'createdAt'],
    group: 'Магазин',
    components: {
      views: {
        list: {
          Component: '/components/payload/views/custom-list',
        },
        edit: {
          root: {
            Component: '/components/payload/views/orders/OrderEditView',
          },
        },
      },
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') return true
      return { customer: { equals: req.user.id } }
    },
    create: () => true,
    update: ({ req }) => {
      if (!req.user) return false
      return req.user.collection === 'users'
    },
  },
  fields: [
    // --- Основна інформація ---
    {
      name: 'displayId',
      label: '№ замовлення',
      type: 'number',
    },
    {
      name: 'customer',
      label: 'Клієнт',
      type: 'relationship',
      relationTo: 'customers',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },

    // --- Статуси (sidebar) ---
    {
      name: 'status',
      label: 'Статус',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'В обробці', value: 'pending' },
        { label: 'Виконано', value: 'completed' },
        { label: 'Скасовано', value: 'canceled' },
        { label: 'Потребує дій', value: 'requires_action' },
        { label: 'Архів', value: 'archived' },
      ],
      // Labels must match ORDER_STATUS_LABELS in lib/payload/types.ts
      admin: { position: 'sidebar' },
    },
    {
      name: 'paymentStatus',
      label: 'Оплата',
      type: 'select',
      defaultValue: 'awaiting',
      options: [
        { label: 'Очікує оплати', value: 'awaiting' },
        { label: 'Оплачено', value: 'paid' },
        { label: 'Повернено', value: 'refunded' },
      ],
      // Labels must match PAYMENT_STATUS_LABELS in lib/payload/types.ts
      admin: { position: 'sidebar' },
    },
    {
      name: 'fulfillmentStatus',
      label: 'Доставка',
      type: 'select',
      defaultValue: 'not_fulfilled',
      options: [
        { label: 'Не відправлено', value: 'not_fulfilled' },
        { label: 'Відправлено', value: 'shipped' },
        { label: 'Доставлено', value: 'delivered' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'trackingNumber',
      label: 'Номер ТТН',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Номер для відстеження посилки',
      },
    },

    // --- Товари ---
    {
      name: 'items',
      label: 'Товари',
      type: 'array',
      labels: { singular: 'Товар', plural: 'Товари' },
      fields: [
        { name: 'productTitle', label: 'Назва', type: 'text', required: true },
        { name: 'variantTitle', label: 'Варіант', type: 'text' },
        { name: 'quantity', label: 'Кількість', type: 'number', required: true },
        { name: 'unitPrice', label: 'Ціна за од.', type: 'number', required: true },
        { name: 'subtotal', label: 'Сума', type: 'number', required: true },
        { name: 'productId', type: 'number', admin: { hidden: true } },
        { name: 'thumbnail', type: 'text', admin: { hidden: true } },
      ],
    },

    // --- Адреса доставки ---
    {
      name: 'shippingAddress',
      label: 'Адреса доставки',
      type: 'group',
      fields: [
        { name: 'firstName', label: "Ім'я", type: 'text' as const },
        { name: 'lastName', label: 'Прізвище', type: 'text' as const },
        { name: 'phone', label: 'Телефон', type: 'text' as const },
        { name: 'city', label: 'Місто', type: 'text' as const },
        { name: 'address1', label: 'Відділення НП', type: 'text' as const },
        { name: 'countryCode', type: 'text' as const, defaultValue: 'ua', admin: { hidden: true } },
        { name: 'postalCode', type: 'text' as const, admin: { hidden: true } },
      ],
    },

    // --- Спосіб оплати / доставки ---
    {
      name: 'paymentMethod',
      label: 'Спосіб оплати',
      type: 'select',
      defaultValue: 'cod',
      options: [
        { label: 'Накладений платіж', value: 'cod' },
        { label: 'Онлайн оплата (Stripe)', value: 'stripe' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'shippingMethod',
      label: 'Спосіб доставки',
      type: 'text',
    },
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
      admin: { position: 'sidebar' },
    },

    // --- Stripe ---
    {
      name: 'stripePaymentIntentId',
      label: 'Stripe Payment Intent',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'ID платіжного наміру Stripe',
      },
    },

    // --- Суми ---
    {
      name: 'subtotal',
      label: 'Підсумок товарів',
      type: 'number',
      required: true,
    },
    {
      name: 'shippingTotal',
      label: 'Доставка',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'total',
      label: 'Загальна сума',
      type: 'number',
      required: true,
    },

    // --- Приховані / технічні ---
    {
      name: 'billingAddress',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'firstName', type: 'text' as const },
        { name: 'lastName', type: 'text' as const },
        { name: 'phone', type: 'text' as const },
        { name: 'city', type: 'text' as const },
        { name: 'address1', type: 'text' as const },
        { name: 'countryCode', type: 'text' as const, defaultValue: 'ua' },
        { name: 'postalCode', type: 'text' as const },
      ],
    },
    { name: 'discountTotal', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'promoCode', type: 'text', admin: { description: 'Застосований промокод' } },
    { name: 'promoDiscount', type: 'number', defaultValue: 0, admin: { description: 'Знижка за промокодом' } },
    { name: 'loyaltyPointsUsed', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'loyaltyDiscount', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'cartId', type: 'text', admin: { hidden: true } },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && !data?.displayId) {
          const payload = req.payload
          // Use req for transaction safety to prevent duplicate displayId
          const lastOrder = await payload.find({
            collection: 'orders',
            sort: '-displayId',
            limit: 1,
            req,
          })
          data!.displayId = (lastOrder.docs[0]?.displayId || 0) + 1
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation }) => {
        // Send shipping notification when fulfillmentStatus changes to 'shipped'
        if (
          operation === 'update' &&
          doc.fulfillmentStatus === 'shipped' &&
          previousDoc?.fulfillmentStatus !== 'shipped' &&
          doc.email
        ) {
          try {
            const { sendShippingNotificationEmail } = await import('@/lib/email/email-actions')
            const shippingAddr = doc.shippingAddress || {}
            sendShippingNotificationEmail({
              email: doc.email,
              customerName: shippingAddr.firstName || '',
              orderNumber: doc.displayId,
              trackingNumber: doc.trackingNumber,
              carrier: doc.shippingMethod || 'Нова Пошта',
            }).catch((err: unknown) => log.error('Shipping notification failed', err instanceof Error ? err : String(err)))
          } catch (err) {
            log.error('Email import failed', err instanceof Error ? err : String(err))
          }
        }
      },
    ],
  },
}
