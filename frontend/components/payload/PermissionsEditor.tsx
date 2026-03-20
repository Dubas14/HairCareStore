'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'
import type { JSONFieldClientComponent } from 'payload'

const PERMISSION_GROUPS = [
  {
    label: 'Каталог',
    items: [
      { slug: 'products', label: 'Товари' },
      { slug: 'categories', label: 'Категорії' },
      { slug: 'brands', label: 'Бренди' },
      { slug: 'ingredients', label: 'Інгредієнти' },
    ],
  },
  {
    label: 'Продажі',
    items: [
      { slug: 'orders', label: 'Замовлення' },
      { slug: 'customers', label: 'Клієнти' },
    ],
  },
  {
    label: 'Маркетинг',
    items: [
      { slug: 'promotions', label: 'Промокоди' },
      { slug: 'automatic-discounts', label: 'Автоматичні знижки' },
      { slug: 'product-bundles', label: 'Набори товарів' },
      { slug: 'subscribers', label: 'Підписники' },
    ],
  },
  {
    label: 'Контент',
    items: [
      { slug: 'banners', label: 'Банери' },
      { slug: 'promo-blocks', label: 'Промо-блоки' },
      { slug: 'pages', label: 'Сторінки' },
      { slug: 'blog-posts', label: 'Блог' },
      { slug: 'reviews', label: 'Відгуки' },
      { slug: 'media', label: 'Медіа' },
    ],
  },
  {
    label: 'Налаштування',
    isGlobals: true,
    items: [
      { slug: 'site-settings', label: 'Налаштування сайту' },
      { slug: 'shipping-config', label: 'Доставка' },
      { slug: 'email-settings', label: 'Email' },
      { slug: 'inventory-settings', label: 'Склад' },
      { slug: 'loyalty-settings', label: 'Лояльність' },
    ],
  },
]

const COLLECTION_ACTIONS = ['read', 'create', 'update', 'delete'] as const
const GLOBAL_ACTIONS = ['read', 'update'] as const
const ACTION_LABELS: Record<string, string> = {
  read: 'Перегляд',
  create: 'Створення',
  update: 'Редагування',
  delete: 'Видалення',
}

export const PermissionsEditor: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<Record<string, Record<string, boolean>>>({ path })

  const permissions = value || {}

  const toggle = (slug: string, action: string) => {
    const current = permissions[slug]?.[action] ?? false
    setValue({
      ...permissions,
      [slug]: {
        ...permissions[slug],
        [action]: !current,
      },
    })
  }

  const toggleAllForSlug = (slug: string, actions: readonly string[], checked: boolean) => {
    const updated: Record<string, boolean> = {}
    for (const action of actions) {
      updated[action] = checked
    }
    setValue({
      ...permissions,
      [slug]: updated,
    })
  }

  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 16 }}>
        Дозволи
      </label>
      {PERMISSION_GROUPS.map((group) => {
        const actions = group.isGlobals ? GLOBAL_ACTIONS : COLLECTION_ACTIONS
        return (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }}>
              {group.label}
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', width: '40%' }}>Колекція</th>
                  {actions.map((action) => (
                    <th key={action} style={{ textAlign: 'center', padding: '8px 12px' }}>
                      {ACTION_LABELS[action]}
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '8px 12px' }}>Усі</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => {
                  const allChecked = actions.every((a) => permissions[item.slug]?.[a] === true)
                  return (
                    <tr key={item.slug} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px 12px' }}>{item.label}</td>
                      {actions.map((action) => (
                        <td key={action} style={{ textAlign: 'center', padding: '8px 12px' }}>
                          <input
                            type="checkbox"
                            checked={permissions[item.slug]?.[action] === true}
                            onChange={() => toggle(item.slug, action)}
                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                          />
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', padding: '8px 12px' }}>
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={() => toggleAllForSlug(item.slug, actions, !allChecked)}
                          style={{ width: 18, height: 18, cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

export default PermissionsEditor
