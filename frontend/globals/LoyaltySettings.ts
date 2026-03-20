import type { GlobalConfig } from 'payload'
import { globalAccess } from '@/lib/payload/access'

export const LoyaltySettings: GlobalConfig = {
  slug: 'loyalty-settings',
  label: 'Налаштування лояльності',
  admin: {
    group: 'Продажі',
    components: {
      views: {
        edit: {
          root: { Component: '/components/payload/loyalty/LoyaltySettingsGlobalView' },
        },
      },
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return true
      return globalAccess('loyalty-settings', 'read')({ req: { user } } as any)
    },
    update: globalAccess('loyalty-settings', 'update'),
  },
  fields: [
    { name: 'pointsPerUah', label: 'Балів за 1 грн', type: 'number', defaultValue: 0.1, admin: { description: 'Бали за кожну 1 грн витрат' } },
    { name: 'pointValue', label: 'Вартість 1 бала (грн)', type: 'number', defaultValue: 1, admin: { description: '1 бал = X грн знижки' } },
    { name: 'maxSpendPercentage', label: 'Макс. % оплати балами', type: 'number', defaultValue: 0.3, admin: { description: 'Макс. % замовлення, який можна оплатити балами (0.3 = 30%)' } },
    { name: 'welcomeBonus', type: 'number', defaultValue: 100, label: 'Вітальний бонус' },
    { name: 'referralBonus', type: 'number', defaultValue: 200, label: 'Бонус за реферала' },
    { name: 'bronzeMin', type: 'number', defaultValue: 0, label: 'Бронза — мін. балів' },
    { name: 'bronzeMultiplier', type: 'number', defaultValue: 1.0, label: 'Бронза — множник' },
    { name: 'silverMin', type: 'number', defaultValue: 1000, label: 'Срібло — мін. балів' },
    { name: 'silverMultiplier', type: 'number', defaultValue: 1.05, label: 'Срібло — множник' },
    { name: 'goldMin', type: 'number', defaultValue: 5000, label: 'Золото — мін. балів' },
    { name: 'goldMultiplier', type: 'number', defaultValue: 1.1, label: 'Золото — множник' },
    { name: 'isActive', type: 'checkbox', defaultValue: true, label: 'Програма активна' },
  ],
}
