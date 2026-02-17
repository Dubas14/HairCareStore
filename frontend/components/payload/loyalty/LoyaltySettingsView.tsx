'use client'

import React, { useEffect, useState } from 'react'
import { getLoyaltySettings, updateLoyaltySettings } from '@/app/actions/loyalty-admin'
import type { LoyaltySettings } from './types'
import LoyaltyLayout from './LoyaltyLayout'
import './loyalty-admin.scss'

const LoyaltySettingsView: React.FC = () => {
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
    } catch (err: any) {
      setError(err.message)
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
      <LoyaltyLayout>
        <div className="loyalty-admin"><div className="loyalty-admin__loading">Завантаження...</div></div>
      </LoyaltyLayout>
    )
  }

  return (
    <LoyaltyLayout>
      <div className="loyalty-admin" style={{ maxWidth: 900 }}>
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
              className={`loyalty-admin__toggle loyalty-admin__toggle--${settings?.is_active ? 'on' : 'off'}`}
              onClick={() => updateField('is_active', !settings?.is_active)}
            />
          </div>
        </div>

        {/* Points Configuration */}
        <div className="loyalty-admin__form-section">
          <h2>Конфігурація балів</h2>
          <div className="loyalty-admin__form-grid loyalty-admin__form-grid--3">
            <div className="loyalty-admin__field">
              <label>Балів за 1 грн</label>
              <input
                type="number"
                step="0.01"
                value={settings?.points_per_uah || 0}
                onChange={(e) => updateField('points_per_uah', parseFloat(e.target.value) || 0)}
              />
              <div className="loyalty-admin__field-hint">0.1 = 1 бал за 10 грн</div>
            </div>
            <div className="loyalty-admin__field">
              <label>Вартість 1 балу (грн)</label>
              <input
                type="number"
                step="0.1"
                value={settings?.point_value || 0}
                onChange={(e) => updateField('point_value', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="loyalty-admin__field">
              <label>Макс. списання (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings?.max_spend_percentage || 0}
                onChange={(e) => updateField('max_spend_percentage', parseFloat(e.target.value) || 0)}
              />
              <div className="loyalty-admin__field-hint">0.3 = 30% від суми замовлення</div>
            </div>
          </div>
        </div>

        {/* Bonuses */}
        <div className="loyalty-admin__form-section">
          <h2>Бонуси</h2>
          <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
            <div className="loyalty-admin__field">
              <label>Welcome бонус</label>
              <input
                type="number"
                value={settings?.welcome_bonus || 0}
                onChange={(e) => updateField('welcome_bonus', parseInt(e.target.value) || 0)}
              />
              <div className="loyalty-admin__field-hint">Бали за реєстрацію</div>
            </div>
            <div className="loyalty-admin__field">
              <label>Реферальний бонус</label>
              <input
                type="number"
                value={settings?.referral_bonus || 0}
                onChange={(e) => updateField('referral_bonus', parseInt(e.target.value) || 0)}
              />
              <div className="loyalty-admin__field-hint">Бали обом учасникам</div>
            </div>
          </div>
        </div>

        {/* Levels */}
        <div className="loyalty-admin__form-section">
          <h2>Рівні</h2>

          <div className="loyalty-admin__level-row loyalty-admin__level-row--bronze">
            <div className="loyalty-admin__level-dot loyalty-admin__level-dot--bronze" />
            <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
              <div className="loyalty-admin__field">
                <label>Bronze — від (балів)</label>
                <input
                  type="number"
                  value={settings?.bronze_min || 0}
                  onChange={(e) => updateField('bronze_min', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="loyalty-admin__field">
                <label>Множник</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings?.bronze_multiplier || 1}
                  onChange={(e) => updateField('bronze_multiplier', parseFloat(e.target.value) || 1)}
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
                  value={settings?.silver_min || 0}
                  onChange={(e) => updateField('silver_min', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="loyalty-admin__field">
                <label>Множник</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings?.silver_multiplier || 1}
                  onChange={(e) => updateField('silver_multiplier', parseFloat(e.target.value) || 1)}
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
                  value={settings?.gold_min || 0}
                  onChange={(e) => updateField('gold_min', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="loyalty-admin__field">
                <label>Множник</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings?.gold_multiplier || 1}
                  onChange={(e) => updateField('gold_multiplier', parseFloat(e.target.value) || 1)}
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
    </LoyaltyLayout>
  )
}

export default LoyaltySettingsView
