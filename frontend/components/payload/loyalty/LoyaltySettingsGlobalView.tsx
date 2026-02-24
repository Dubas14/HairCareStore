'use client'

import React, { useEffect, useState } from 'react'
import { getLoyaltySettings, updateLoyaltySettings } from '@/app/actions/loyalty-admin'
import type { LoyaltySettings } from './types'
import './loyalty-admin.scss'

const LoyaltySettingsGlobalView: React.FC = () => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getLoyaltySettings()
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
      const data = await updateLoyaltySettings(settings)
      setSettings(data.settings)
      setSuccess('Налаштування збережено')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof LoyaltySettings, value: number | boolean) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
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
        <h1>Налаштування програми лояльності</h1>
        <p>Конфігурація балів, рівнів та бонусів</p>
      </div>

      {error && <div className="loyalty-admin__alert loyalty-admin__alert--error">{error}</div>}
      {success && <div className="loyalty-admin__alert loyalty-admin__alert--success">{success}</div>}

      {/* Program Status */}
      <div className="loyalty-admin__form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--color-base-700)' }}>Статус програми</div>
            <div style={{ fontSize: 12, color: 'var(--color-base-400)' }}>
              Увімкнення/вимкнення нарахування балів
            </div>
          </div>
          <button
            type="button"
            className={`loyalty-admin__toggle loyalty-admin__toggle--${settings?.isActive ? 'on' : 'off'}`}
            onClick={() => updateField('isActive', !settings?.isActive)}
          />
        </div>
      </div>

      {/* Points Configuration */}
      <div className="loyalty-admin__form-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, opacity: 0.6 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Конфігурація балів
        </h2>
        <div className="loyalty-admin__form-grid loyalty-admin__form-grid--3">
          <div className="loyalty-admin__field">
            <label>Балів за 1 грн</label>
            <input
              type="number"
              step="0.01"
              value={settings?.pointsPerUah || 0}
              onChange={(e) => updateField('pointsPerUah', parseFloat(e.target.value) || 0)}
            />
            <div className="loyalty-admin__field-hint">0.1 = 1 бал за 10 грн</div>
          </div>
          <div className="loyalty-admin__field">
            <label>Вартість 1 балу (грн)</label>
            <input
              type="number"
              step="0.1"
              value={settings?.pointValue || 0}
              onChange={(e) => updateField('pointValue', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="loyalty-admin__field">
            <label>Макс. списання (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={settings?.maxSpendPercentage || 0}
              onChange={(e) => updateField('maxSpendPercentage', parseFloat(e.target.value) || 0)}
            />
            <div className="loyalty-admin__field-hint">0.3 = 30% від суми замовлення</div>
          </div>
        </div>
      </div>

      {/* Bonuses */}
      <div className="loyalty-admin__form-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, opacity: 0.6 }}>
            <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
          Бонуси
        </h2>
        <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
          <div className="loyalty-admin__field">
            <label>Welcome бонус</label>
            <input
              type="number"
              value={settings?.welcomeBonus || 0}
              onChange={(e) => updateField('welcomeBonus', parseInt(e.target.value) || 0)}
            />
            <div className="loyalty-admin__field-hint">Бали за реєстрацію</div>
          </div>
          <div className="loyalty-admin__field">
            <label>Реферальний бонус</label>
            <input
              type="number"
              value={settings?.referralBonus || 0}
              onChange={(e) => updateField('referralBonus', parseInt(e.target.value) || 0)}
            />
            <div className="loyalty-admin__field-hint">Бали обом учасникам</div>
          </div>
        </div>
      </div>

      {/* Levels */}
      <div className="loyalty-admin__form-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 8, opacity: 0.6 }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Рівні
        </h2>

        <div className="loyalty-admin__level-row loyalty-admin__level-row--bronze">
          <div className="loyalty-admin__level-dot loyalty-admin__level-dot--bronze" />
          <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
            <div className="loyalty-admin__field">
              <label>Bronze — від (балів)</label>
              <input
                type="number"
                value={settings?.bronzeMin || 0}
                onChange={(e) => updateField('bronzeMin', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="loyalty-admin__field">
              <label>Множник</label>
              <input
                type="number"
                step="0.01"
                value={settings?.bronzeMultiplier || 1}
                onChange={(e) => updateField('bronzeMultiplier', parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        <div className="loyalty-admin__level-row loyalty-admin__level-row--silver">
          <div className="loyalty-admin__level-dot loyalty-admin__level-dot--silver" />
          <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
            <div className="loyalty-admin__field">
              <label>Silver — від (балів)</label>
              <input
                type="number"
                value={settings?.silverMin || 0}
                onChange={(e) => updateField('silverMin', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="loyalty-admin__field">
              <label>Множник</label>
              <input
                type="number"
                step="0.01"
                value={settings?.silverMultiplier || 1}
                onChange={(e) => updateField('silverMultiplier', parseFloat(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        <div className="loyalty-admin__level-row loyalty-admin__level-row--gold">
          <div className="loyalty-admin__level-dot loyalty-admin__level-dot--gold" />
          <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
            <div className="loyalty-admin__field">
              <label>Gold — від (балів)</label>
              <input
                type="number"
                value={settings?.goldMin || 0}
                onChange={(e) => updateField('goldMin', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="loyalty-admin__field">
              <label>Множник</label>
              <input
                type="number"
                step="0.01"
                value={settings?.goldMultiplier || 1}
                onChange={(e) => updateField('goldMultiplier', parseFloat(e.target.value) || 1)}
              />
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

export default LoyaltySettingsGlobalView
