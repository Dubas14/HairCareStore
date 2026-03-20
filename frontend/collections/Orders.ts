import type { CollectionConfig } from 'payload'
import { collectionAccess } from '@/lib/payload/access'
import { createLogger } from '@/lib/logger'

const log = createLogger('orders')

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Замовлення', plural: 'Замовлення' },
  admin: {
    useAsTitle: 'displayId',
    defaultColumns: ['displayId', 'email', 'status', 'total', 'createdAt'],
    group: 'Продажі',
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
      if (req.user.collection === 'users') {
        return collectionAccess('orders', 'read')({ req } as any)
      }
      return { customer: { equals: req.user.id } }
    },
    create: ({ req: { user } }) => {
      // Public create (checkout)
      if (!user) return true
      if (user.collection !== 'users') return true
      return collectionAccess('orders', 'create')({ req: { user } } as any)
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.collection === 'users') {
        return collectionAccess('orders', 'update')({ req } as any)
      }
      return false
    },
    delete: collectionAccess('orders', 'delete'),
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
      admin: { initCollapsed: true },
      fields: [
        { name: 'productTitle', label: 'Назва', type: 'text', required: true },
        { name: 'variantTitle', label: 'Варіант', type: 'text' },
        { name: 'quantity', label: 'Кількість', type: 'number', required: true },
        { name: 'unitPrice', label: 'Ціна за од.', type: 'number', required: true },
        { name: 'subtotal', label: 'Сума', type: 'number', required: true },
        { name: 'productId', label: 'ID товару', type: 'number', admin: { hidden: true } },
        { name: 'thumbnail', label: 'Мініатюра', type: 'text', admin: { hidden: true } },
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
        { name: 'countryCode', label: 'Код країни', type: 'text' as const, defaultValue: 'ua', admin: { hidden: true } },
        { name: 'postalCode', label: 'Поштовий індекс', type: 'text' as const, admin: { hidden: true } },
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
      label: 'Stripe Payment Intent (платіжний намір)',
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
      label: 'Адреса оплати',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'firstName', label: "Ім'я", type: 'text' as const },
        { name: 'lastName', label: 'Прізвище', type: 'text' as const },
        { name: 'phone', label: 'Телефон', type: 'text' as const },
        { name: 'city', label: 'Місто', type: 'text' as const },
        { name: 'address1', label: 'Адреса', type: 'text' as const },
        { name: 'countryCode', label: 'Код країни', type: 'text' as const, defaultValue: 'ua' },
        { name: 'postalCode', label: 'Поштовий індекс', type: 'text' as const },
      ],
    },
    { name: 'discountTotal', label: 'Загальна знижка', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'promoCode', label: 'Промокод', type: 'text', admin: { description: 'Застосований промокод' } },
    { name: 'promoDiscount', label: 'Знижка промокоду', type: 'number', defaultValue: 0, admin: { description: 'Знижка за промокодом' } },
    { name: 'loyaltyPointsUsed', label: 'Використано балів', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'loyaltyDiscount', label: 'Знижка за бали', type: 'number', defaultValue: 0, admin: { hidden: true } },
    { name: 'cartId', label: 'ID кошика', type: 'text', admin: { hidden: true } },
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
      async ({ doc, operation, req }) => {
        // Increment salesCount on products when order is created
        if (operation === 'create' && doc.items && Array.isArray(doc.items)) {
          for (const item of doc.items) {
            const productId = item.productId
            if (!productId) continue
            try {
              const product = await req.payload.findByID({ collection: 'products', id: productId, depth: 0 })
              if (product) {
                const currentSales = (product as any).salesCount || 0
                await req.payload.update({
                  collection: 'products',
                  id: productId,
                  data: { salesCount: currentSales + (item.quantity || 1) },
                  depth: 0,
                })
              }
            } catch { /* ignore */ }
          }
        }
      },
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

        // Send review request when fulfillmentStatus changes to 'delivered'
        if (
          operation === 'update' &&
          doc.fulfillmentStatus === 'delivered' &&
          previousDoc?.fulfillmentStatus !== 'delivered' &&
          doc.email &&
          doc.items?.length
        ) {
          try {
            const { sendReviewRequestEmail } = await import('@/lib/email/email-actions')
            const shippingAddr = doc.shippingAddress || {}
            const items = (doc.items as Array<{ productTitle?: string; productId?: number; thumbnail?: string }>).map((item) => ({
              title: item.productTitle || 'Товар',
              handle: '', // Will be resolved below
              imageUrl: item.thumbnail || undefined,
            }))

            // Try to resolve handles from productIds
            const { getPayload } = await import('payload')
            const config = (await import('@payload-config')).default
            const payload = await getPayload({ config })
            for (const [idx, orderItem] of (doc.items as Array<{ productId?: number }>).entries()) {
              if (orderItem.productId) {
                try {
                  const product = await payload.findByID({ collection: 'products', id: orderItem.productId, depth: 0 })
                  if (product?.handle) items[idx].handle = product.handle as string
                } catch { /* skip */ }
              }
            }

            // Only include items with resolved handles
            const validItems = items.filter((i) => i.handle)
            if (validItems.length > 0) {
              sendReviewRequestEmail({
                email: doc.email,
                customerName: shippingAddr.firstName || '',
                orderNumber: doc.displayId,
                items: validItems,
              }).catch((err: unknown) => log.error('Review request failed', err instanceof Error ? err : String(err)))
            }
          } catch (err) {
            log.error('Review request email failed', err instanceof Error ? err : String(err))
          }
        }
      },
    ],
  },
}
