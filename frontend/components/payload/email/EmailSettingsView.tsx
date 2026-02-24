'use client'

import React, { useEffect, useState } from 'react'
import { getEmailSettings, updateEmailSettings } from '@/app/actions/email-admin'
import type { EmailSettingsData } from '@/app/actions/email-admin'
import '../loyalty/loyalty-admin.scss'

const EMAIL_TYPE_LABELS: Record<string, { label: string; description: string }> = {
  orderConfirmation: { label: 'Підтвердження замовлення', description: 'Лист після оформлення замовлення' },
  welcome: { label: 'Вітальний лист', description: 'Лист після реєстрації нового клієнта' },
  shippingNotification: { label: 'Відправка замовлення', description: 'Сповіщення про відправку з трекінгом' },
  reviewRequest: { label: 'Запит на відгук', description: 'Прохання залишити відгук після доставки' },
  abandonedCart: { label: 'Покинутий кошик', description: 'Нагадування про товари в кошику' },
  priceDrop: { label: 'Зниження ціни', description: 'Сповіщення про знижку на товар з вішлиста' },
  backInStock: { label: 'Знову в наявності', description: 'Сповіщення коли товар повернувся в наявність' },
  loyaltyLevelUp: { label: 'Підвищення рівня', description: 'Вітання з новим рівнем лояльності' },
  newsletterConfirmation: { label: 'Підтвердження підписки', description: 'Підтвердження email для розсилки' },
}

const EmailSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getEmailSettings()
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
      const { stats: _stats, ...dataToSave } = settings
      const data = await updateEmailSettings(dataToSave)
      setSettings(data.settings)
      setSuccess('Налаштування збережено')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const toggleEmailType = (type: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      emailTypes: {
        ...settings.emailTypes,
        [type]: !settings.emailTypes[type as keyof typeof settings.emailTypes],
      },
    })
  }

  const updateCartConfig = (field: keyof EmailSettingsData['abandonedCartConfig'], value: number) => {
    if (!settings) return
    setSettings({
      ...settings,
      abandonedCartConfig: {
        ...settings.abandonedCartConfig,
        [field]: value,
      },
    })
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
        <h1>Налаштування email-розсилок</h1>
        <p>Керування типами листів, таймінгом та статистикою</p>
      </div>

      {error && <div className="loyalty-admin__alert loyalty-admin__alert--error">{error}</div>}
      {success && <div className="loyalty-admin__alert loyalty-admin__alert--success">{success}</div>}

      {/* Global Toggle */}
      <div className="loyalty-admin__form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--color-base-700)' }}>Email-розсилки</div>
            <div style={{ fontSize: 12, color: 'var(--color-base-400)' }}>
              Глобальний вимикач усіх автоматичних email
            </div>
          </div>
          <button
            type="button"
            className={`loyalty-admin__toggle loyalty-admin__toggle--${settings?.isActive ? 'on' : 'off'}`}
            onClick={() => settings && setSettings({ ...settings, isActive: !settings.isActive })}
          />
        </div>
      </div>

      {/* Email Types */}
      <div className="loyalty-admin__form-section">
        <h2>Типи листів</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {Object.entries(EMAIL_TYPE_LABELS).map(([key, { label, description }]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--hl-radius-sm)',
                background: 'var(--color-base-50)',
              }}
            >
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--color-base-700)' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--color-base-400)', marginTop: 2 }}>{description}</div>
              </div>
              <button
                type="button"
                className={`loyalty-admin__toggle loyalty-admin__toggle--${
                  settings?.emailTypes[key as keyof EmailSettingsData['emailTypes']] ? 'on' : 'off'
                }`}
                onClick={() => toggleEmailType(key)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Abandoned Cart Timing */}
      <div className="loyalty-admin__form-section">
        <h2>Таймінг покинутого кошика</h2>
        <div className="loyalty-admin__form-grid loyalty-admin__form-grid--3">
          <div className="loyalty-admin__field">
            <label>1-й лист (годин)</label>
            <input
              type="number"
              min="1"
              value={settings?.abandonedCartConfig.firstEmailHours ?? 1}
              onChange={(e) => updateCartConfig('firstEmailHours', parseInt(e.target.value) || 1)}
            />
            <div className="loyalty-admin__field-hint">Після покинутого кошика</div>
          </div>
          <div className="loyalty-admin__field">
            <label>2-й лист (годин)</label>
            <input
              type="number"
              min="1"
              value={settings?.abandonedCartConfig.secondEmailHours ?? 24}
              onChange={(e) => updateCartConfig('secondEmailHours', parseInt(e.target.value) || 24)}
            />
            <div className="loyalty-admin__field-hint">Нагадування</div>
          </div>
          <div className="loyalty-admin__field">
            <label>3-й лист (годин)</label>
            <input
              type="number"
              min="1"
              value={settings?.abandonedCartConfig.thirdEmailHours ?? 72}
              onChange={(e) => updateCartConfig('thirdEmailHours', parseInt(e.target.value) || 72)}
            />
            <div className="loyalty-admin__field-hint">Фінальне нагадування</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="loyalty-admin__form-section">
        <h2>Статистика</h2>
        <div className="loyalty-admin__stats">
          <div className="loyalty-admin__stat-card">
            <div className="loyalty-admin__stat-card-label">Всього відправлено</div>
            <div className="loyalty-admin__stat-card-value">{settings?.stats?.totalSent ?? 0}</div>
          </div>
          <div className="loyalty-admin__stat-card">
            <div className="loyalty-admin__stat-card-label">Останній лист</div>
            <div className="loyalty-admin__stat-card-value" style={{ fontSize: 16 }}>
              {settings?.stats?.lastSentAt
                ? new Date(settings.stats.lastSentAt).toLocaleString('uk-UA')
                : '—'}
            </div>
          </div>
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

export default EmailSettingsView
