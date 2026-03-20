'use client'

import React from 'react'

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

type Permissions = Record<string, Record<string, boolean>>

interface Props {
  value: Permissions
  onChange: (value: Permissions) => void
}

export function InlinePermissionsEditor({ value, onChange }: Props) {
  const permissions = value || {}

  const toggle = (slug: string, action: string) => {
    const current = permissions[slug]?.[action] ?? false
    onChange({
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
    onChange({
      ...permissions,
      [slug]: updated,
    })
  }

  return (
    <div style={{
      marginTop: 20,
      padding: 20,
      background: 'var(--color-base-50, #f8f9fa)',
      borderRadius: 10,
      border: '1px solid var(--color-base-200, #e9ecef)',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>
        Дозволи
      </h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
        Налаштуйте, до яких розділів має доступ цей редактор. Адмін завжди має повний доступ.
      </p>
      {PERMISSION_GROUPS.map((group) => {
        const actions = group.isGlobals ? GLOBAL_ACTIONS : COLLECTION_ACTIONS
        return (
          <div key={group.label} style={{ marginBottom: 20 }}>
            <h4 style={{
              margin: '0 0 8px',
              fontSize: 12,
              fontWeight: 600,
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}>
              {group.label}
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                  <th style={{ textAlign: 'left', padding: '6px 10px', width: '40%', fontWeight: 500, color: '#6b7280' }}>
                    Розділ
                  </th>
                  {actions.map((action) => (
                    <th key={action} style={{ textAlign: 'center', padding: '6px 10px', fontWeight: 500, color: '#6b7280' }}>
                      {ACTION_LABELS[action]}
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '6px 10px', fontWeight: 500, color: '#6b7280' }}>Усі</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => {
                  const allChecked = actions.every((a) => permissions[item.slug]?.[a] === true)
                  return (
                    <tr key={item.slug} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 10px', color: '#1a1a2e' }}>{item.label}</td>
                      {actions.map((action) => (
                        <td key={action} style={{ textAlign: 'center', padding: '6px 10px' }}>
                          <input
                            type="checkbox"
                            checked={permissions[item.slug]?.[action] === true}
                            onChange={() => toggle(item.slug, action)}
                            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#5bc4c4' }}
                          />
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', padding: '6px 10px' }}>
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={() => toggleAllForSlug(item.slug, actions, !allChecked)}
                          style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#5bc4c4' }}
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

export default InlinePermissionsEditor
