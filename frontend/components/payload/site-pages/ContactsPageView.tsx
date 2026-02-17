'use client'

import React, { useEffect, useState } from 'react'
import { getSitePageSettings, updateSitePageSettings } from '@/app/actions/site-pages'
import type { SiteSettingsData } from '@/lib/payload/client'
import SitePagesLayout from './SitePagesLayout'
import './site-pages.scss'

interface Contacts {
  phone: string
  phoneLink: string
  phoneSchedule: string
  email: string
  emailDescription: string
  address: string
  addressLink: string
  addressDescription: string
  schedule: string
  scheduleDescription: string
}

interface Social {
  instagram: string
  telegram: string
  facebook: string
}

const emptyContacts: Contacts = {
  phone: '', phoneLink: '', phoneSchedule: '',
  email: '', emailDescription: '',
  address: '', addressLink: '', addressDescription: '',
  schedule: '', scheduleDescription: '',
}

const emptySocial: Social = {
  instagram: '', telegram: '', facebook: '',
}

const ContactsPageView: React.FC = () => {
  const [contacts, setContacts] = useState<Contacts>(emptyContacts)
  const [social, setSocial] = useState<Social>(emptySocial)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getSitePageSettings()
      .then(({ settings }) => {
        if (settings?.contacts) setContacts({ ...emptyContacts, ...settings.contacts })
        if (settings?.social) setSocial({ ...emptySocial, ...settings.social })
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
      await updateSitePageSettings({ contacts, social } as Partial<SiteSettingsData>)
      setSuccess('Збережено')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateContact = (field: keyof Contacts, value: string) => {
    setContacts(prev => ({ ...prev, [field]: value }))
  }

  const updateSocial = (field: keyof Social, value: string) => {
    setSocial(prev => ({ ...prev, [field]: value }))
  }

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
          <h1>Контакти</h1>
          <p>Контактна інформація та соціальні мережі</p>
        </div>

        {error && <div className="sp-admin__alert sp-admin__alert--error">{error}</div>}
        {success && <div className="sp-admin__alert sp-admin__alert--success">{success}</div>}

        {/* ─── Phone ───────────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Телефон</h2>
          <div className="sp-admin__grid sp-admin__grid--3">
            <div className="sp-admin__field">
              <label>Номер телефону</label>
              <input type="text" value={contacts.phone} onChange={(e) => updateContact('phone', e.target.value)} placeholder="+38 (067) 123-45-67" />
            </div>
            <div className="sp-admin__field">
              <label>Посилання (tel:)</label>
              <input type="text" value={contacts.phoneLink} onChange={(e) => updateContact('phoneLink', e.target.value)} placeholder="tel:+380671234567" />
            </div>
            <div className="sp-admin__field">
              <label>Графік</label>
              <input type="text" value={contacts.phoneSchedule} onChange={(e) => updateContact('phoneSchedule', e.target.value)} placeholder="Пн-Пт: 9:00 - 18:00" />
            </div>
          </div>
        </div>

        {/* ─── Email ───────────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Email</h2>
          <div className="sp-admin__grid sp-admin__grid--2">
            <div className="sp-admin__field">
              <label>Email адреса</label>
              <input type="email" value={contacts.email} onChange={(e) => updateContact('email', e.target.value)} placeholder="hello@hairlab.ua" />
            </div>
            <div className="sp-admin__field">
              <label>Опис</label>
              <input type="text" value={contacts.emailDescription} onChange={(e) => updateContact('emailDescription', e.target.value)} placeholder="Відповідаємо протягом 2 годин" />
            </div>
          </div>
        </div>

        {/* ─── Address ─────────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Адреса</h2>
          <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 14 }}>
            <div className="sp-admin__field">
              <label>Адреса</label>
              <input type="text" value={contacts.address} onChange={(e) => updateContact('address', e.target.value)} placeholder="м. Київ, вул. Хрещатик, 1" />
            </div>
            <div className="sp-admin__field">
              <label>Посилання на карту</label>
              <input type="text" value={contacts.addressLink} onChange={(e) => updateContact('addressLink', e.target.value)} placeholder="https://maps.google.com" />
            </div>
          </div>
          <div className="sp-admin__field">
            <label>Опис адреси</label>
            <input type="text" value={contacts.addressDescription} onChange={(e) => updateContact('addressDescription', e.target.value)} placeholder="Шоурум працює з 10:00 до 20:00" />
          </div>
        </div>

        {/* ─── Schedule ────────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Графік роботи</h2>
          <div className="sp-admin__grid sp-admin__grid--2">
            <div className="sp-admin__field">
              <label>Загальний графік</label>
              <input type="text" value={contacts.schedule} onChange={(e) => updateContact('schedule', e.target.value)} placeholder="Щодня з 9:00 до 21:00" />
            </div>
            <div className="sp-admin__field">
              <label>Опис</label>
              <input type="text" value={contacts.scheduleDescription} onChange={(e) => updateContact('scheduleDescription', e.target.value)} placeholder="Онлайн-підтримка 24/7" />
            </div>
          </div>
        </div>

        {/* ─── Social ──────────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2>Соціальні мережі</h2>
          <div className="sp-admin__grid sp-admin__grid--3">
            <div className="sp-admin__field">
              <label>Instagram</label>
              <input type="text" value={social.instagram} onChange={(e) => updateSocial('instagram', e.target.value)} placeholder="https://instagram.com/..." />
            </div>
            <div className="sp-admin__field">
              <label>Telegram</label>
              <input type="text" value={social.telegram} onChange={(e) => updateSocial('telegram', e.target.value)} placeholder="https://t.me/..." />
            </div>
            <div className="sp-admin__field">
              <label>Facebook</label>
              <input type="text" value={social.facebook} onChange={(e) => updateSocial('facebook', e.target.value)} placeholder="https://facebook.com/..." />
            </div>
          </div>
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

export default ContactsPageView
