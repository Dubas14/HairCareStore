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
    { name: 'pointsPerUah', type: 'number', defaultValue: 0.1, admin: { description: 'Points earned per 1 UAH spent' } },
    { name: 'pointValue', type: 'number', defaultValue: 1, admin: { description: '1 point = X UAH discount' } },
    { name: 'maxSpendPercentage', type: 'number', defaultValue: 0.3, admin: { description: 'Max % of order payable with points (0.3 = 30%)' } },
    { name: 'welcomeBonus', type: 'number', defaultValue: 100 },
    { name: 'referralBonus', type: 'number', defaultValue: 200 },
    { name: 'bronzeMin', type: 'number', defaultValue: 0 },
    { name: 'bronzeMultiplier', type: 'number', defaultValue: 1.0 },
    { name: 'silverMin', type: 'number', defaultValue: 1000 },
    { name: 'silverMultiplier', type: 'number', defaultValue: 1.05 },
    { name: 'goldMin', type: 'number', defaultValue: 5000 },
    { name: 'goldMultiplier', type: 'number', defaultValue: 1.1 },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
