'use client'

import React, { useEffect, useState } from 'react'
import { getSitePageSettings, updateSitePageSettings } from '@/app/actions/site-pages'
import type { SiteSettingsData } from '@/lib/payload/client'
import SitePagesLayout from './SitePagesLayout'
import './site-pages.scss'

interface Feature {
  title: string
  description: string
}

interface Stat {
  value: string
  label: string
}

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

const AboutPageView: React.FC = () => {
  const [intro, setIntro] = useState('')
  const [story, setStory] = useState('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getSitePageSettings()
      .then(({ settings }) => {
        if (settings?.about) {
          setIntro(settings.about.intro || '')
          setStory(settings.about.story || '')
          setFeatures(settings.about.features || [])
          setStats(settings.about.stats || [])
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
        about: { intro, story, features, stats },
      } as Partial<SiteSettingsData>)
      setSuccess('Збережено')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    setFeatures(prev => prev.map((f, i) => i === index ? { ...f, [field]: value } : f))
  }
  const addFeature = () => setFeatures(prev => [...prev, { title: '', description: '' }])
  const removeFeature = (index: number) => setFeatures(prev => prev.filter((_, i) => i !== index))

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    setStats(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }
  const addStat = () => setStats(prev => [...prev, { value: '', label: '' }])
  const removeStat = (index: number) => setStats(prev => prev.filter((_, i) => i !== index))

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
          <h1>Про нас</h1>
          <p>Контент сторінки &laquo;Про нас&raquo; на сайті</p>
        </div>

        {error && <div className="sp-admin__alert sp-admin__alert--error">{error}</div>}
        {success && <div className="sp-admin__alert sp-admin__alert--success">{success}</div>}

        {/* Intro & Story */}
        <div className="sp-admin__section">
          <h2>Основний текст</h2>
          <div className="sp-admin__field" style={{ marginBottom: 14 }}>
            <label>Вступний текст (виділений)</label>
            <textarea rows={3} value={intro} onChange={(e) => setIntro(e.target.value)} />
          </div>
          <div className="sp-admin__field">
            <label>Історія компанії</label>
            <textarea rows={4} value={story} onChange={(e) => setStory(e.target.value)} />
          </div>
        </div>

        {/* Features */}
        <div className="sp-admin__section">
          <div className="sp-admin__array-header">
            <h3>Переваги ({features.length})</h3>
          </div>
          {features.map((f, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>#{i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeFeature(i)}>
                  <TrashIcon />
                </button>
              </div>
              <div className="sp-admin__grid sp-admin__grid--2">
                <div className="sp-admin__field">
                  <label>Заголовок</label>
                  <input type="text" value={f.title} onChange={(e) => updateFeature(i, 'title', e.target.value)} />
                </div>
                <div className="sp-admin__field">
                  <label>Опис</label>
                  <input type="text" value={f.description} onChange={(e) => updateFeature(i, 'description', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addFeature}>
            <PlusIcon /> Додати перевагу
          </button>
        </div>

        {/* Stats */}
        <div className="sp-admin__section">
          <div className="sp-admin__array-header">
            <h3>Статистика ({stats.length})</h3>
          </div>
          {stats.map((s, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span>#{i + 1}</span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeStat(i)}>
                  <TrashIcon />
                </button>
              </div>
              <div className="sp-admin__grid sp-admin__grid--2">
                <div className="sp-admin__field">
                  <label>Значення</label>
                  <input type="text" value={s.value} onChange={(e) => updateStat(i, 'value', e.target.value)} placeholder="5+" />
                </div>
                <div className="sp-admin__field">
                  <label>Підпис</label>
                  <input type="text" value={s.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="років досвіду" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="sp-admin__add-btn" onClick={addStat}>
            <PlusIcon /> Додати показник
          </button>
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

export default AboutPageView
