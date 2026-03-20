'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { getSitePageSettings, updateSitePageSettings } from '@/app/actions/site-pages'
import type { SiteSettingsData } from '@/lib/payload/client'
import '../site-pages/site-pages.scss'

// ─── Types ───────────────────────────────────────────────────────────────────

type TabKey = 'contacts' | 'social' | 'delivery' | 'payment' | 'about'

interface Method {
  title: string
  description: string
  isHighlight: boolean
}

interface Step {
  title: string
  description: string
}

interface FaqItem {
  question: string
  answer: string
}

interface Feature {
  title: string
  description: string
}

interface Stat {
  value: string
  label: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: 'contacts', label: 'Контакти' },
  { key: 'social', label: 'Соцмережі' },
  { key: 'delivery', label: 'Доставка' },
  { key: 'payment', label: 'Оплата' },
  { key: 'about', label: 'Про нас' },
]

// SVG icons (inline, minimal)
const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M8 3v10M3 8h10" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 4h10M6 4V2h4v2M5 4l.5 9h5L11 4" />
  </svg>
)

// ─── Sub-components ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

const Field: React.FC<FieldProps> = ({ label, hint, children }) => (
  <div className="sp-admin__field">
    <label>{label}</label>
    {children}
    {hint && <div className="sp-admin__field-hint">{hint}</div>}
  </div>
)

interface TextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
)

interface TextAreaProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

const TextArea: React.FC<TextAreaProps> = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
  />
)

// ─── Array section helpers ────────────────────────────────────────────────────

interface ArraySectionHeaderProps {
  title: string
  onAdd: () => void
}

const ArraySectionHeader: React.FC<ArraySectionHeaderProps> = ({ title, onAdd }) => (
  <div className="sp-admin__array-header">
    <h3>{title}</h3>
    <button type="button" className="sp-admin__add-btn" onClick={onAdd}>
      <PlusIcon /> Додати
    </button>
  </div>
)

interface ArrayItemHeaderProps {
  index: number
  label?: string
  onRemove: () => void
}

const ArrayItemHeader: React.FC<ArrayItemHeaderProps> = ({ index, label, onRemove }) => (
  <div className="sp-admin__array-item-header">
    <span>{label ?? `#${index + 1}`}</span>
    <button type="button" className="sp-admin__remove-btn" onClick={onRemove} title="Видалити">
      <TrashIcon />
    </button>
  </div>
)

// ─── Contacts Tab ─────────────────────────────────────────────────────────────

type Contacts = SiteSettingsData['contacts']

interface ContactsTabProps {
  contacts: Contacts
  onChange: (c: Contacts) => void
}

const ContactsTab: React.FC<ContactsTabProps> = ({ contacts, onChange }) => {
  const set = (field: keyof Contacts, value: string) =>
    onChange({ ...contacts, [field]: value })

  return (
    <>
      <div className="sp-admin__section">
        <h2>Телефон</h2>
        <div className="sp-admin__grid sp-admin__grid--3">
          <Field label="Номер">
            <TextInput value={contacts.phone} onChange={(v) => set('phone', v)} placeholder="+38 (067) 123-45-67" />
          </Field>
          <Field label="Посилання (tel:)" hint="Формат: tel:+380XXXXXXXXX">
            <TextInput value={contacts.phoneLink} onChange={(v) => set('phoneLink', v)} placeholder="tel:+380671234567" />
          </Field>
          <Field label="Графік">
            <TextInput value={contacts.phoneSchedule} onChange={(v) => set('phoneSchedule', v)} placeholder="Пн-Пт: 9:00 - 18:00" />
          </Field>
        </div>
      </div>

      <div className="sp-admin__section">
        <h2>Email</h2>
        <div className="sp-admin__grid sp-admin__grid--2">
          <Field label="Email адреса">
            <TextInput value={contacts.email} onChange={(v) => set('email', v)} placeholder="hello@hairlab.ua" type="email" />
          </Field>
          <Field label="Опис">
            <TextInput value={contacts.emailDescription} onChange={(v) => set('emailDescription', v)} placeholder="Відповідаємо протягом 2 годин" />
          </Field>
        </div>
      </div>

      <div className="sp-admin__section">
        <h2>Адреса</h2>
        <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 14 }}>
          <Field label="Адреса">
            <TextInput value={contacts.address} onChange={(v) => set('address', v)} placeholder="м. Київ, вул. Хрещатик, 1" />
          </Field>
          <Field label="Посилання на карту">
            <TextInput value={contacts.addressLink} onChange={(v) => set('addressLink', v)} placeholder="https://maps.google.com" />
          </Field>
        </div>
        <Field label="Опис адреси">
          <TextInput value={contacts.addressDescription} onChange={(v) => set('addressDescription', v)} placeholder="Шоурум працює з 10:00 до 20:00" />
        </Field>
      </div>

      <div className="sp-admin__section">
        <h2>Графік роботи</h2>
        <div className="sp-admin__grid sp-admin__grid--2">
          <Field label="Загальний графік">
            <TextInput value={contacts.schedule} onChange={(v) => set('schedule', v)} placeholder="Щодня з 9:00 до 21:00" />
          </Field>
          <Field label="Опис графіку">
            <TextInput value={contacts.scheduleDescription} onChange={(v) => set('scheduleDescription', v)} placeholder="Онлайн-підтримка 24/7" />
          </Field>
        </div>
      </div>
    </>
  )
}

// ─── Social Tab ───────────────────────────────────────────────────────────────

type Social = SiteSettingsData['social']

interface SocialTabProps {
  social: Social
  onChange: (s: Social) => void
}

const SocialTab: React.FC<SocialTabProps> = ({ social, onChange }) => {
  const set = (field: keyof Social, value: string) =>
    onChange({ ...social, [field]: value })

  return (
    <div className="sp-admin__section">
      <h2>Соціальні мережі</h2>
      <div className="sp-admin__grid sp-admin__grid--3">
        <Field label="Instagram">
          <TextInput value={social.instagram} onChange={(v) => set('instagram', v)} placeholder="https://instagram.com/hairlab.ua" />
        </Field>
        <Field label="Telegram">
          <TextInput value={social.telegram} onChange={(v) => set('telegram', v)} placeholder="https://t.me/hairlab_ua" />
        </Field>
        <Field label="Facebook">
          <TextInput value={social.facebook} onChange={(v) => set('facebook', v)} placeholder="https://facebook.com/hairlab.ua" />
        </Field>
      </div>
    </div>
  )
}

// ─── Delivery Tab ─────────────────────────────────────────────────────────────

type Delivery = SiteSettingsData['delivery']

interface DeliveryTabProps {
  delivery: Delivery
  onChange: (d: Delivery) => void
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({ delivery, onChange }) => {
  const setMethods = (methods: Method[]) => onChange({ ...delivery, methods })
  const setSteps = (steps: Step[]) => onChange({ ...delivery, steps })
  const setFaq = (faq: FaqItem[]) => onChange({ ...delivery, faq })

  const updateMethod = (i: number, field: keyof Method, value: string | boolean) => {
    const next = delivery.methods.map((m, idx) => idx === i ? { ...m, [field]: value } : m)
    setMethods(next)
  }

  const updateStep = (i: number, field: keyof Step, value: string) => {
    const next = delivery.steps.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    setSteps(next)
  }

  const updateFaq = (i: number, field: keyof FaqItem, value: string) => {
    const next = delivery.faq.map((f, idx) => idx === i ? { ...f, [field]: value } : f)
    setFaq(next)
  }

  return (
    <>
      {/* Methods */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Способи доставки"
          onAdd={() => setMethods([...delivery.methods, { title: '', description: '', isHighlight: false }])}
        />
        {delivery.methods.map((m, i) => (
          <div key={i} className="sp-admin__array-item">
            <ArrayItemHeader index={i} label={m.title || `Спосіб ${i + 1}`} onRemove={() => setMethods(delivery.methods.filter((_, idx) => idx !== i))} />
            <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 10 }}>
              <Field label="Назва">
                <TextInput value={m.title} onChange={(v) => updateMethod(i, 'title', v)} placeholder="Нова Пошта" />
              </Field>
              <Field label="Виділити">
                <label className="sp-admin__checkbox">
                  <input
                    type="checkbox"
                    checked={m.isHighlight}
                    onChange={(e) => updateMethod(i, 'isHighlight', e.target.checked)}
                  />
                  <span>Показати як рекомендований</span>
                </label>
              </Field>
            </div>
            <Field label="Опис">
              <TextArea value={m.description} onChange={(v) => updateMethod(i, 'description', v)} placeholder="Доставка 1-3 дні по всій Україні..." rows={2} />
            </Field>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Етапи доставки"
          onAdd={() => setSteps([...delivery.steps, { title: '', description: '' }])}
        />
        {delivery.steps.map((s, i) => (
          <div key={i} className="sp-admin__array-item">
            <ArrayItemHeader index={i} label={s.title || `Крок ${i + 1}`} onRemove={() => setSteps(delivery.steps.filter((_, idx) => idx !== i))} />
            <div className="sp-admin__grid sp-admin__grid--2">
              <Field label="Назва кроку">
                <TextInput value={s.title} onChange={(v) => updateStep(i, 'title', v)} placeholder="Оформлення" />
              </Field>
              <Field label="Опис">
                <TextInput value={s.description} onChange={(v) => updateStep(i, 'description', v)} placeholder="Залиште заявку на сайті або зателефонуйте нам" />
              </Field>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Часті запитання"
          onAdd={() => setFaq([...delivery.faq, { question: '', answer: '' }])}
        />
        {delivery.faq.map((f, i) => (
          <div key={i} className="sp-admin__array-item">
            <ArrayItemHeader index={i} label={f.question || `Запитання ${i + 1}`} onRemove={() => setFaq(delivery.faq.filter((_, idx) => idx !== i))} />
            <Field label="Запитання">
              <TextInput value={f.question} onChange={(v) => updateFaq(i, 'question', v)} placeholder="Яка вартість доставки?" />
            </Field>
            <div style={{ marginTop: 10 }}>
              <Field label="Відповідь">
                <TextArea value={f.answer} onChange={(v) => updateFaq(i, 'answer', v)} placeholder="Доставка Новою Поштою безкоштовна при замовленні від 1500 грн..." rows={2} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────

type Payment = SiteSettingsData['payment']

interface PaymentTabProps {
  payment: Payment
  onChange: (p: Payment) => void
}

const PaymentTab: React.FC<PaymentTabProps> = ({ payment, onChange }) => {
  const setMethods = (methods: Method[]) => onChange({ ...payment, methods })
  const setFaq = (faq: FaqItem[]) => onChange({ ...payment, faq })

  const updateMethod = (i: number, field: keyof Method, value: string | boolean) => {
    const next = payment.methods.map((m, idx) => idx === i ? { ...m, [field]: value } : m)
    setMethods(next)
  }

  const updateFaq = (i: number, field: keyof FaqItem, value: string) => {
    const next = payment.faq.map((f, idx) => idx === i ? { ...f, [field]: value } : f)
    setFaq(next)
  }

  return (
    <>
      {/* Methods */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Способи оплати"
          onAdd={() => setMethods([...payment.methods, { title: '', description: '', isHighlight: false }])}
        />
        {payment.methods.map((m, i) => (
          <div key={i} className="sp-admin__array-item">
            <ArrayItemHeader index={i} label={m.title || `Спосіб ${i + 1}`} onRemove={() => setMethods(payment.methods.filter((_, idx) => idx !== i))} />
            <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 10 }}>
              <Field label="Назва">
                <TextInput value={m.title} onChange={(v) => updateMethod(i, 'title', v)} placeholder="Карткою онлайн" />
              </Field>
              <Field label="Виділити">
                <label className="sp-admin__checkbox">
                  <input
                    type="checkbox"
                    checked={m.isHighlight}
                    onChange={(e) => updateMethod(i, 'isHighlight', e.target.checked)}
                  />
                  <span>Показати як рекомендований</span>
                </label>
              </Field>
            </div>
            <Field label="Опис">
              <TextArea value={m.description} onChange={(v) => updateMethod(i, 'description', v)} placeholder="Visa, Mastercard, Apple Pay, Google Pay..." rows={2} />
            </Field>
          </div>
        ))}
      </div>

      {/* Security text */}
      <div className="sp-admin__section">
        <h2>Текст безпеки</h2>
        <Field label="Текст" hint="Показується внизу секції оплати на сайті">
          <TextArea value={payment.securityText} onChange={(v) => onChange({ ...payment, securityText: v })} placeholder="Всі платежі захищені технологією 3D Secure..." rows={3} />
        </Field>
      </div>

      {/* FAQ */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Часті запитання"
          onAdd={() => setFaq([...payment.faq, { question: '', answer: '' }])}
        />
        {payment.faq.map((f, i) => (
          <div key={i} className="sp-admin__array-item">
            <ArrayItemHeader index={i} label={f.question || `Запитання ${i + 1}`} onRemove={() => setFaq(payment.faq.filter((_, idx) => idx !== i))} />
            <Field label="Запитання">
              <TextInput value={f.question} onChange={(v) => updateFaq(i, 'question', v)} placeholder="Чи безпечно платити карткою?" />
            </Field>
            <div style={{ marginTop: 10 }}>
              <Field label="Відповідь">
                <TextArea value={f.answer} onChange={(v) => updateFaq(i, 'answer', v)} placeholder="Так, абсолютно безпечно..." rows={2} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── About Tab ────────────────────────────────────────────────────────────────

type About = SiteSettingsData['about']

interface AboutTabProps {
  about: About
  onChange: (a: About) => void
}

const AboutTab: React.FC<AboutTabProps> = ({ about, onChange }) => {
  const setFeatures = (features: Feature[]) => onChange({ ...about, features })
  const setStats = (stats: Stat[]) => onChange({ ...about, stats })

  const updateFeature = (i: number, field: keyof Feature, value: string) => {
    const next = about.features.map((f, idx) => idx === i ? { ...f, [field]: value } : f)
    setFeatures(next)
  }

  const updateStat = (i: number, field: keyof Stat, value: string) => {
    const next = about.stats.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    setStats(next)
  }

  return (
    <>
      <div className="sp-admin__section">
        <h2>Тексти сторінки</h2>
        <Field label="Вступний текст" hint='Перший абзац на сторінці "Про нас"'>
          <TextArea value={about.intro} onChange={(v) => onChange({ ...about, intro: v })} placeholder="HAIR LAB — це більше ніж магазин косметики..." rows={3} />
        </Field>
        <div style={{ marginTop: 14 }}>
          <Field label="Історія компанії" hint="Другий абзац — розповідь про компанію">
            <TextArea value={about.story} onChange={(v) => onChange({ ...about, story: v })} placeholder="Ми заснували HAIR LAB з простою місією..." rows={3} />
          </Field>
        </div>
      </div>

      {/* Features */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Переваги"
          onAdd={() => setFeatures([...about.features, { title: '', description: '' }])}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {about.features.map((f, i) => (
            <div key={i} className="sp-admin__array-item" style={{ marginBottom: 0 }}>
              <ArrayItemHeader index={i} label={f.title || `Перевага ${i + 1}`} onRemove={() => setFeatures(about.features.filter((_, idx) => idx !== i))} />
              <Field label="Назва">
                <TextInput value={f.title} onChange={(v) => updateFeature(i, 'title', v)} placeholder="Тільки оригінали" />
              </Field>
              <div style={{ marginTop: 8 }}>
                <Field label="Опис">
                  <TextInput value={f.description} onChange={(v) => updateFeature(i, 'description', v)} placeholder="Працюємо напряму з брендами..." />
                </Field>
              </div>
            </div>
          ))}
        </div>
        {about.features.length === 0 && (
          <p style={{ color: 'var(--color-base-400)', fontSize: 13, margin: 0 }}>Немає переваг. Додайте першу.</p>
        )}
      </div>

      {/* Stats */}
      <div className="sp-admin__section">
        <ArraySectionHeader
          title="Статистика"
          onAdd={() => setStats([...about.stats, { value: '', label: '' }])}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {about.stats.map((s, i) => (
            <div key={i} className="sp-admin__array-item" style={{ marginBottom: 0 }}>
              <ArrayItemHeader index={i} label={s.value ? `${s.value} ${s.label}` : `Показник ${i + 1}`} onRemove={() => setStats(about.stats.filter((_, idx) => idx !== i))} />
              <div className="sp-admin__grid sp-admin__grid--2">
                <Field label="Значення" hint='Напр. "5+", "50K+"'>
                  <TextInput value={s.value} onChange={(v) => updateStat(i, 'value', v)} placeholder="5+" />
                </Field>
                <Field label="Підпис">
                  <TextInput value={s.label} onChange={(v) => updateStat(i, 'label', v)} placeholder="років досвіду" />
                </Field>
              </div>
            </div>
          ))}
        </div>
        {about.stats.length === 0 && (
          <p style={{ color: 'var(--color-base-400)', fontSize: 13, margin: 0 }}>Немає показників. Додайте перший.</p>
        )}
      </div>
    </>
  )
}

// ─── Empty state defaults ─────────────────────────────────────────────────────

const emptyContacts: SiteSettingsData['contacts'] = {
  phone: '', phoneLink: '', phoneSchedule: '',
  email: '', emailDescription: '',
  address: '', addressLink: '', addressDescription: '',
  schedule: '', scheduleDescription: '',
}

const emptySocial: SiteSettingsData['social'] = {
  instagram: '', telegram: '', facebook: '',
}

const emptyDelivery: SiteSettingsData['delivery'] = {
  methods: [], steps: [], faq: [],
}

const emptyPayment: SiteSettingsData['payment'] = {
  methods: [], securityText: '', faq: [],
}

const emptyAbout: SiteSettingsData['about'] = {
  intro: '', story: '', features: [], stats: [],
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SiteSettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('contacts')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [contacts, setContacts] = useState<SiteSettingsData['contacts']>(emptyContacts)
  const [social, setSocial] = useState<SiteSettingsData['social']>(emptySocial)
  const [delivery, setDelivery] = useState<SiteSettingsData['delivery']>(emptyDelivery)
  const [payment, setPayment] = useState<SiteSettingsData['payment']>(emptyPayment)
  const [about, setAbout] = useState<SiteSettingsData['about']>(emptyAbout)

  useEffect(() => {
    getSitePageSettings()
      .then(({ settings }) => {
        if (!settings) return
        if (settings.contacts) setContacts({ ...emptyContacts, ...settings.contacts })
        if (settings.social) setSocial({ ...emptySocial, ...settings.social })
        if (settings.delivery) setDelivery({ ...emptyDelivery, ...settings.delivery })
        if (settings.payment) setPayment({ ...emptyPayment, ...settings.payment })
        if (settings.about) setAbout({ ...emptyAbout, ...settings.about })
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateSitePageSettings({ contacts, social, delivery, payment, about } as Partial<SiteSettingsData>)
      setSuccess('Налаштування збережено')
      setTimeout(() => setSuccess(null), 4000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }, [contacts, social, delivery, payment, about])

  if (loading) {
    return (
      <div className="sp-admin" style={{ padding: '24px 32px' }}>
        <div className="sp-admin__loading">Завантаження...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="sp-admin__header" style={{ marginBottom: 0 }}>
          <h1>Налаштування сайту</h1>
          <p>Контакти, соцмережі, доставка, оплата та інформація про компанію</p>
        </div>
        <button
          type="button"
          className="sp-admin__btn sp-admin__btn--primary"
          onClick={handleSave}
          disabled={saving}
          style={{ flexShrink: 0, marginTop: 4 }}
        >
          {saving ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="sp-admin__alert sp-admin__alert--error">{error}</div>}
      {success && <div className="sp-admin__alert sp-admin__alert--success">{success}</div>}

      {/* Tab navigation */}
      <nav style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--color-base-200)',
        marginBottom: 24,
        paddingBottom: 0,
      }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: activeTab === key ? 600 : 500,
              color: activeTab === key ? 'var(--color-sea-600)' : 'var(--color-base-500)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === key ? '2px solid var(--color-sea-500)' : '2px solid transparent',
              marginBottom: -1,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="sp-admin">
        {activeTab === 'contacts' && (
          <ContactsTab contacts={contacts} onChange={setContacts} />
        )}
        {activeTab === 'social' && (
          <SocialTab social={social} onChange={setSocial} />
        )}
        {activeTab === 'delivery' && (
          <DeliveryTab delivery={delivery} onChange={setDelivery} />
        )}
        {activeTab === 'payment' && (
          <PaymentTab payment={payment} onChange={setPayment} />
        )}
        {activeTab === 'about' && (
          <AboutTab about={about} onChange={setAbout} />
        )}
      </div>

      {/* Bottom save button (convenience) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          type="button"
          className="sp-admin__btn sp-admin__btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Збереження...' : 'Зберегти зміни'}
        </button>
      </div>
    </div>
  )
}

export default SiteSettingsView
