'use client'

import React, { useEffect, useState } from 'react'
import { getInventorySettings, updateInventorySettings } from '@/app/actions/inventory-admin'
import type { InventorySettingsData } from '@/app/actions/inventory-admin'
import '../loyalty/loyalty-admin.scss'

const OUT_OF_STOCK_OPTIONS = [
  { value: 'show_unavailable', label: 'Показати як недоступний', description: 'Товар видно, але не можна додати в кошик' },
  { value: 'hide', label: 'Приховати', description: 'Товар зникає з каталогу і пошуку' },
] as const

const InventorySettingsView: React.FC = () => {
  const [settings, setSettings] = useState<InventorySettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getInventorySettings()
      .then((data) => {
        setSettings(data.settings)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await updateInventorySettings(settings)
      setSettings(data.settings)
      setSuccess('Налаштування збережено')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="loyalty-admin" style={{ padding: '24px 32px', maxWidth: 900 }}>
        <div className="loyalty-admin__loading">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="loyalty-admin" style={{ padding: '24px 32px', maxWidth: 900 }}>
      <div className="loyalty-admin__header">
        <h1>Налаштування складу</h1>
        <p>Пороги запасів, поведінка при відсутності товару та сповіщення</p>
      </div>

      {error && <div className="loyalty-admin__alert loyalty-admin__alert--error">{error}</div>}
      {success && <div className="loyalty-admin__alert loyalty-admin__alert--success">{success}</div>}

      {/* Low Stock Threshold */}
      <div className="loyalty-admin__form-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, opacity: 0.6 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Поріг низького запасу
        </h2>
        <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
          <div className="loyalty-admin__field">
            <label>Кількість одиниць</label>
            <input
              type="number"
              min="0"
              value={settings?.lowStockThreshold ?? 5}
              onChange={(e) =>
                settings && setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) || 0 })
              }
            />
            <div className="loyalty-admin__field-hint">
              Товар вважається з низьким запасом, коли залишок менше цього числа
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              borderRadius: 'var(--hl-radius-md)',
              background: (settings?.lowStockThreshold ?? 5) > 0
                ? 'rgba(234, 179, 8, 0.08)'
                : 'rgba(156, 163, 175, 0.08)',
              border: '1px solid',
              borderColor: (settings?.lowStockThreshold ?? 5) > 0
                ? 'rgba(234, 179, 8, 0.2)'
                : 'var(--color-base-200)',
              flex: 1,
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={(settings?.lowStockThreshold ?? 5) > 0 ? '#b45309' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-base-600)' }}>
                  Попередження
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-base-400)' }}>
                  {(settings?.lowStockThreshold ?? 5) > 0
                    ? `Попередження при залишку < ${settings?.lowStockThreshold} шт.`
                    : 'Попередження вимкнено'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Out of Stock Behavior */}
      <div className="loyalty-admin__form-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, opacity: 0.6 }}>
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
          Поведінка при відсутності товару
        </h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {OUT_OF_STOCK_OPTIONS.map((option) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                borderRadius: 'var(--hl-radius-md)',
                border: '1px solid',
                borderColor: settings?.outOfStockBehavior === option.value
                  ? 'var(--color-sea-400)'
                  : 'var(--color-base-200)',
                background: settings?.outOfStockBehavior === option.value
                  ? 'rgba(91, 196, 196, 0.04)'
                  : 'var(--color-base-0)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                type="radio"
                name="outOfStockBehavior"
                value={option.value}
                checked={settings?.outOfStockBehavior === option.value}
                onChange={() =>
                  settings && setSettings({ ...settings, outOfStockBehavior: option.value })
                }
                style={{ accentColor: 'var(--color-sea-500)', width: 18, height: 18 }}
              />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-base-700)' }}>
                  {option.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-base-400)', marginTop: 2 }}>
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Back in Stock Notifications */}
      <div className="loyalty-admin__form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, opacity: 0.6 }}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Сповіщення &quot;Знову в наявності&quot;
            </h2>
            <div style={{ fontSize: 12, color: 'var(--color-base-400)' }}>
              Дозволити клієнтам підписуватися на сповіщення про повернення товару в наявність
            </div>
          </div>
          <button
            type="button"
            className={`loyalty-admin__toggle loyalty-admin__toggle--${settings?.backInStockNotifications ? 'on' : 'off'}`}
            onClick={() =>
              settings && setSettings({ ...settings, backInStockNotifications: !settings.backInStockNotifications })
            }
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="loyalty-admin__btn loyalty-admin__btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Збереження...' : 'Зберегти налаштування'}
        </button>
      </div>
    </div>
  )
}

export default InventorySettingsView
