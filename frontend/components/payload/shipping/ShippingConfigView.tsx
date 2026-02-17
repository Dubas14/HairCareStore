'use client'

import React, { useEffect, useState } from 'react'
import {
  getShippingConfig,
  updateShippingConfig,
  type ShippingMethod,
} from '@/app/actions/shipping'
import '../site-pages/site-pages.scss'

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const emptyMethod: ShippingMethod = {
  methodId: '',
  name: '',
  price: 0,
  freeAbove: null,
  isActive: true,
}

const ShippingConfigView: React.FC = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getShippingConfig()
      .then(({ config }) => {
        setMethods(config?.methods || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { config } = await updateShippingConfig({ methods })
      setMethods(config.methods || [])
      setSuccess('Збережено')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateMethod = (i: number, field: string, value: any) =>
    setMethods(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  const addMethod = () => setMethods(prev => [...prev, { ...emptyMethod }])
  const removeMethod = (i: number) => setMethods(prev => prev.filter((_, idx) => idx !== i))

  if (loading) {
    return (
      <div className="sp" style={{ padding: '24px 32px', maxWidth: 1400 }}>
        <div className="sp-admin"><div className="sp-admin__loading">Завантаження...</div></div>
      </div>
    )
  }

  return (
    <div className="sp" style={{ padding: '24px 32px', maxWidth: 1400, animation: 'spFadeIn 0.4s ease-out' }}>
      <div className="sp-admin" style={{ maxWidth: 900 }}>
        <div className="sp-admin__header">
          <h1>Конфігурація доставки</h1>
          <p>Способи доставки, ціни та пороги безкоштовної доставки для checkout</p>
        </div>

        {error && <div className="sp-admin__alert sp-admin__alert--error">{error}</div>}
        {success && <div className="sp-admin__alert sp-admin__alert--success">{success}</div>}

        <div className="sp-admin__section">
          <div className="sp-admin__array-header">
            <h2 style={{ margin: 0 }}>Способи доставки ({methods.length})</h2>
          </div>

          {methods.map((m, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  #{i + 1}
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: m.isActive ? '#4a9468' : '#b06060',
                    }}
                  />
                  {m.isActive ? 'Активний' : 'Неактивний'}
                </span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeMethod(i)}>
                  <TrashIcon />
                </button>
              </div>

              <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 10 }}>
                <div className="sp-admin__field">
                  <label>ID способу</label>
                  <input
                    type="text"
                    value={m.methodId}
                    onChange={(e) => updateMethod(i, 'methodId', e.target.value)}
                    placeholder="nova-poshta"
                  />
                  <div className="sp-admin__field-hint">Унікальний ідентифікатор для логіки замовлення</div>
                </div>
                <div className="sp-admin__field">
                  <label>Назва</label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMethod(i, 'name', e.target.value)}
                    placeholder="Нова Пошта"
                  />
                </div>
              </div>

              <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 10 }}>
                <div className="sp-admin__field">
                  <label>Ціна (грн)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={m.price}
                    onChange={(e) => updateMethod(i, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="sp-admin__field">
                  <label>Безкоштовно від (грн)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={m.freeAbove ?? ''}
                    onChange={(e) => updateMethod(i, 'freeAbove', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="1500"
                  />
                  <div className="sp-admin__field-hint">Залиште порожнім, якщо немає порогу</div>
                </div>
              </div>

              <label className="sp-admin__checkbox">
                <input
                  type="checkbox"
                  checked={m.isActive}
                  onChange={(e) => updateMethod(i, 'isActive', e.target.checked)}
                />
                <span>Активний</span>
              </label>
            </div>
          ))}

          <button type="button" className="sp-admin__add-btn" onClick={addMethod}>
            <PlusIcon /> Додати спосіб доставки
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="sp-admin__btn sp-admin__btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShippingConfigView
