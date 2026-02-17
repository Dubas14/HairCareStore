'use client'

import React, { useEffect, useState } from 'react'
import { getSitePageSettings, updateSitePageSettings } from '@/app/actions/site-pages'
import type { SiteSettingsData } from '@/lib/payload/client'
import SitePagesLayout from './SitePagesLayout'
import './site-pages.scss'

interface Method { title: string; description: string; isHighlight: boolean }
interface Step { title: string; description: string }
interface FaqItem { question: string; answer: string }

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

const DeliveryPageView: React.FC = () => {
  const [deliveryMethods, setDeliveryMethods] = useState<Method[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [deliveryFaq, setDeliveryFaq] = useState<FaqItem[]>([])
  const [paymentMethods, setPaymentMethods] = useState<Method[]>([])
  const [securityText, setSecurityText] = useState('')
  const [paymentFaq, setPaymentFaq] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getSitePageSettings()
      .then(({ settings }) => {
        if (settings?.delivery) {
          setDeliveryMethods(settings.delivery.methods || [])
          setSteps(settings.delivery.steps || [])
          setDeliveryFaq(settings.delivery.faq || [])
        }
        if (settings?.payment) {
          setPaymentMethods(settings.payment.methods || [])
          setSecurityText(settings.payment.securityText || '')
          setPaymentFaq(settings.payment.faq || [])
        }
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
      await updateSitePageSettings({
        delivery: { methods: deliveryMethods, steps, faq: deliveryFaq },
        payment: { methods: paymentMethods, securityText, faq: paymentFaq },
      } as Partial<SiteSettingsData>)
      setSuccess('Збережено')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // --- Delivery methods helpers ---
  const updateDMethod = (i: number, field: string, value: any) =>
    setDeliveryMethods(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  const addDMethod = () => setDeliveryMethods(prev => [...prev, { title: '', description: '', isHighlight: false }])
  const removeDMethod = (i: number) => setDeliveryMethods(prev => prev.filter((_, idx) => idx !== i))

  // --- Steps helpers ---
  const updateStep = (i: number, field: keyof Step, value: string) =>
    setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  const addStep = () => setSteps(prev => [...prev, { title: '', description: '' }])
  const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i))

  // --- Delivery FAQ helpers ---
  const updateDFaq = (i: number, field: keyof FaqItem, value: string) =>
    setDeliveryFaq(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  const addDFaq = () => setDeliveryFaq(prev => [...prev, { question: '', answer: '' }])
  const removeDFaq = (i: number) => setDeliveryFaq(prev => prev.filter((_, idx) => idx !== i))

  // --- Payment methods helpers ---
  const updatePMethod = (i: number, field: string, value: any) =>
    setPaymentMethods(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))
  const addPMethod = () => setPaymentMethods(prev => [...prev, { title: '', description: '', isHighlight: false }])
  const removePMethod = (i: number) => setPaymentMethods(prev => prev.filter((_, idx) => idx !== i))

  // --- Payment FAQ helpers ---
  const updatePFaq = (i: number, field: keyof FaqItem, value: string) =>
    setPaymentFaq(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  const addPFaq = () => setPaymentFaq(prev => [...prev, { question: '', answer: '' }])
  const removePFaq = (i: number) => setPaymentFaq(prev => prev.filter((_, idx) => idx !== i))

  if (loading) {
    return (
      <SitePagesLayout>
        <div className="sp-admin"><div className="sp-admin__loading">Завантаження...</div></div>
      </SitePagesLayout>
    )
  }

  return (
    <SitePagesLayout>
      <div className="sp-admin" style={{ maxWidth: 900 }}>
        <div className="sp-admin__header">
          <h1>Доставка та оплата</h1>
          <p>Контент сторінок &laquo;Доставка&raquo; та &laquo;Оплата&raquo; на сайті</p>
        </div>

        {error && <div className="sp-admin__alert sp-admin__alert--error">{error}</div>}
        {success && <div className="sp-admin__alert sp-admin__alert--success">{success}</div>}

        {/* ─── Delivery Methods ─────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Способи доставки</h2>
          {deliveryMethods.map((m, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>#{i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeDMethod(i)}><TrashIcon /></button>
              </div>
              <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 8 }}>
                <div className="sp-admin__field">
                  <label>Назва</label>
                  <input type="text" value={m.title} onChange={(e) => updateDMethod(i, 'title', e.target.value)} />
                </div>
                <div className="sp-admin__field">
                  <label>Опис</label>
                  <input type="text" value={m.description} onChange={(e) => updateDMethod(i, 'description', e.target.value)} />
                </div>
              </div>
              <label className="sp-admin__checkbox">
                <input type="checkbox" checked={m.isHighlight} onChange={(e) => updateDMethod(i, 'isHighlight', e.target.checked)} />
                <span>Виділити</span>
              </label>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addDMethod}><PlusIcon /> Додати спосіб</button>
        </div>

        {/* ─── Delivery Steps ──────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Кроки доставки</h2>
          {steps.map((s, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>Крок {i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeStep(i)}><TrashIcon /></button>
              </div>
              <div className="sp-admin__grid sp-admin__grid--2">
                <div className="sp-admin__field">
                  <label>Заголовок</label>
                  <input type="text" value={s.title} onChange={(e) => updateStep(i, 'title', e.target.value)} />
                </div>
                <div className="sp-admin__field">
                  <label>Опис</label>
                  <input type="text" value={s.description} onChange={(e) => updateStep(i, 'description', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addStep}><PlusIcon /> Додати крок</button>
        </div>

        {/* ─── Delivery FAQ ────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>FAQ доставки</h2>
          {deliveryFaq.map((f, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>#{i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeDFaq(i)}><TrashIcon /></button>
              </div>
              <div className="sp-admin__field" style={{ marginBottom: 10 }}>
                <label>Запитання</label>
                <input type="text" value={f.question} onChange={(e) => updateDFaq(i, 'question', e.target.value)} />
              </div>
              <div className="sp-admin__field">
                <label>Відповідь</label>
                <textarea rows={2} value={f.answer} onChange={(e) => updateDFaq(i, 'answer', e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addDFaq}><PlusIcon /> Додати запитання</button>
        </div>

        {/* ═══ Payment Section ═══════════════════════════════ */}
        <div style={{ margin: '32px 0 20px', borderTop: '2px solid var(--color-base-200)', paddingTop: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-base-800)', margin: '0 0 4px' }}>Оплата</h2>
          <p style={{ color: 'var(--color-base-400)', fontSize: 13, margin: '0 0 20px' }}>Способи оплати та безпека платежів</p>
        </div>

        {/* ─── Payment Methods ─────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Способи оплати</h2>
          {paymentMethods.map((m, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>#{i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removePMethod(i)}><TrashIcon /></button>
              </div>
              <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 8 }}>
                <div className="sp-admin__field">
                  <label>Назва</label>
                  <input type="text" value={m.title} onChange={(e) => updatePMethod(i, 'title', e.target.value)} />
                </div>
                <div className="sp-admin__field">
                  <label>Опис</label>
                  <input type="text" value={m.description} onChange={(e) => updatePMethod(i, 'description', e.target.value)} />
                </div>
              </div>
              <label className="sp-admin__checkbox">
                <input type="checkbox" checked={m.isHighlight} onChange={(e) => updatePMethod(i, 'isHighlight', e.target.checked)} />
                <span>Виділити</span>
              </label>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addPMethod}><PlusIcon /> Додати спосіб</button>
        </div>

        {/* ─── Security Text ───────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Безпека платежів</h2>
          <div className="sp-admin__field">
            <label>Текст про безпеку</label>
            <textarea rows={3} value={securityText} onChange={(e) => setSecurityText(e.target.value)} />
          </div>
        </div>

        {/* ─── Payment FAQ ─────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>FAQ оплати</h2>
          {paymentFaq.map((f, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>#{i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removePFaq(i)}><TrashIcon /></button>
              </div>
              <div className="sp-admin__field" style={{ marginBottom: 10 }}>
                <label>Запитання</label>
                <input type="text" value={f.question} onChange={(e) => updatePFaq(i, 'question', e.target.value)} />
              </div>
              <div className="sp-admin__field">
                <label>Відповідь</label>
                <textarea rows={2} value={f.answer} onChange={(e) => updatePFaq(i, 'answer', e.target.value)} />
              </div>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addPFaq}><PlusIcon /> Додати запитання</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="sp-admin__btn sp-admin__btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>
    </SitePagesLayout>
  )
}

export default DeliveryPageView
