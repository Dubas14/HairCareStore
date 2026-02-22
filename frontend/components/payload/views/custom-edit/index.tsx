'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteCollectionDoc, getCollectionFieldDefaults } from '@/app/actions/admin-views'
import type { FieldSchema } from '@/app/actions/admin-views'
import { StyledInput, StyledTextarea, StyledCheckbox, StyledSelect, StyledUpload, FieldGroup, FieldRow } from './CustomFields'
import { SidebarMeta, QuickActions } from './SidebarMeta'

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIP_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'sizes', '_status'])
const SIDEBAR_FIELDS = new Set(['status', 'slug', 'order', 'featured', 'publishedAt'])

const COLLECTION_LABELS: Record<string, string> = {
  products: 'Товар',
  categories: 'Категорія',
  brands: 'Бренд',
  orders: 'Замовлення',
  customers: 'Клієнт',
  reviews: 'Відгук',
  pages: 'Сторінка',
  'blog-posts': 'Стаття',
  'promo-blocks': 'Промо блок',
  banners: 'Банер',
  media: 'Медіа',
  users: 'Користувач',
  promotions: 'Промокод',
  'automatic-discounts': 'Автоматична знижка',
  subscribers: 'Підписник',
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconArrowLeft() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function IconSave() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

// ─── Field Renderer ───────────────────────────────────────────────────────────

function renderField(
  key: string,
  value: any,
  onChange: (key: string, val: any) => void,
  fieldMeta?: FieldSchema
): React.ReactNode {
  const label = fieldMeta?.label || key
  const ro = fieldMeta?.readOnly || false

  // If we have schema metadata, use it for proper rendering
  if (fieldMeta) {
    // Skip hidden fields
    if (fieldMeta.hidden) return null

    switch (fieldMeta.type) {
      case 'checkbox':
        return <StyledCheckbox key={key} label={label} checked={!!value} onChange={ro ? () => {} : (v) => onChange(key, v)} />
      case 'select':
        return (
          <StyledSelect
            key={key}
            label={label}
            value={String(value ?? '')}
            onChange={ro ? () => {} : (v) => onChange(key, v)}
            options={fieldMeta.options || []}
            required={fieldMeta.required}
          />
        )
      case 'upload':
        return (
          <StyledUpload
            key={key}
            label={label}
            value={value}
            onChange={ro ? () => {} : (v) => onChange(key, v)}
            relationTo={fieldMeta.relationTo}
          />
        )
      case 'relationship':
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const display = value.title || value.name || value.email || `ID: ${value.id}`
          return <StyledInput key={key} label={label} value={display} onChange={() => {}} disabled />
        }
        if (Array.isArray(value)) {
          return <StyledInput key={key} label={`${label} (${value.length} елементів)`} value={`[${value.length} шт.]`} onChange={() => {}} disabled />
        }
        return <StyledInput key={key} label={label} value={value != null ? String(value) : '—'} onChange={() => {}} disabled />
      case 'textarea':
        return <StyledTextarea key={key} label={label} value={String(value ?? '')} onChange={ro ? () => {} : (v) => onChange(key, v)} rows={4} required={fieldMeta.required} />
      case 'richText':
        return <StyledTextarea key={key} label={label} value={typeof value === 'string' ? value : ''} onChange={ro ? () => {} : (v) => onChange(key, v)} rows={6} />
      case 'number':
        return <StyledInput key={key} label={label} value={value ?? 0} onChange={ro ? () => {} : (v) => onChange(key, Number(v) || 0)} type="number" required={fieldMeta.required} disabled={ro} />
      case 'array': {
        const items = Array.isArray(value) ? value : []
        const arrayLabel = fieldMeta.labels?.plural || label
        if (items.length === 0) {
          return <StyledInput key={key} label={arrayLabel} value="— порожньо —" onChange={() => {}} disabled />
        }
        return (
          <FieldGroup key={key} title={`${arrayLabel} (${items.length})`}>
            {items.map((item: any, idx: number) => {
              const itemLabel = fieldMeta.labels?.singular || label
              const subFields = fieldMeta.fields || []
              const visibleSubFields = subFields.filter((sf) => !sf.hidden)
              if (visibleSubFields.length === 0) return null
              // Show a compact summary of each array item
              return (
                <FieldGroup key={idx} title={`${itemLabel} #${idx + 1}`}>
                  {visibleSubFields.map((sf) => {
                    const sfVal = item[sf.name]
                    return renderField(sf.name, sfVal, (k, v) => {
                      const updated = [...items]
                      updated[idx] = { ...updated[idx], [k]: v }
                      onChange(key, updated)
                    }, { ...sf, readOnly: ro || sf.readOnly })
                  })}
                </FieldGroup>
              )
            })}
          </FieldGroup>
        )
      }
      case 'group':
        if (typeof value === 'object' && value !== null) {
          const subFields = fieldMeta.fields || []
          const visibleSubFields = subFields.filter((sf) => !sf.hidden)
          if (visibleSubFields.length === 0) return null
          return (
            <FieldGroup key={key} title={label}>
              {visibleSubFields.map((sf) => {
                return renderField(sf.name, value[sf.name], (k, v) => {
                  onChange(key, { ...value, [k]: v })
                }, { ...sf, readOnly: ro || sf.readOnly })
              })}
            </FieldGroup>
          )
        }
        return null
      default:
        // text, email, date, code, etc.
        return <StyledInput key={key} label={label} value={String(value ?? '')} onChange={ro ? () => {} : (v) => onChange(key, v)} required={fieldMeta.required} disabled={ro} />
    }
  }

  // Fallback: no schema — infer from JS type (for backwards compat)
  if (typeof value === 'boolean') {
    return <StyledCheckbox key={key} label={label} checked={value} onChange={(v) => onChange(key, v)} />
  }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Check if this looks like a media object (has url)
    if (value.url || value.filename) {
      return <StyledUpload key={key} label={label} value={value} onChange={(v) => onChange(key, v)} />
    }
    const display = value.title || value.name || value.email || JSON.stringify(value).slice(0, 60)
    return <StyledInput key={key} label={label} value={display} onChange={() => {}} disabled />
  }
  if (Array.isArray(value)) {
    return <StyledInput key={key} label={`${label} (${value.length} елементів)`} value={`[${value.length} шт.]`} onChange={() => {}} disabled />
  }
  if (typeof value === 'number') {
    return <StyledInput key={key} label={label} value={value} onChange={(v) => onChange(key, Number(v) || 0)} type="number" />
  }
  if (typeof value === 'string' && value.length > 120) {
    return <StyledTextarea key={key} label={label} value={value} onChange={(v) => onChange(key, v)} rows={4} />
  }
  return <StyledInput key={key} label={label} value={String(value ?? '')} onChange={(v) => onChange(key, v)} />
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function EditSkeleton() {
  return (
    <div className="hl-edit-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
        <span className="hl-skeleton" style={{ width: 200, height: 28 }} />
        <span className="hl-skeleton" style={{ width: 120, height: 38 }} />
      </div>
      <div className="hl-edit-layout">
        <div>
          <div className="hl-field-group">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <span className="hl-skeleton" style={{ width: 80, height: 12, marginBottom: 8, display: 'block' }} />
                <span className="hl-skeleton" style={{ width: '100%', height: 38 }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="hl-skeleton" style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomEditView() {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [docId, setDocId] = useState('')
  const [doc, setDoc] = useState<any>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [fieldSchema, setFieldSchema] = useState<FieldSchema[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const isCreate = docId === 'create'

  // Extract slug and docId from URL
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/admin\/collections\/([^/]+)\/([^/]+)/)
    if (match) {
      setSlug(match[1])
      setDocId(match[2])
    }
  }, [])

  // Fetch document + schema (always fetches schema for proper field rendering)
  const fetchDoc = useCallback(async () => {
    if (!slug || !docId) return
    setIsLoading(true)
    try {
      // Always fetch schema for proper field rendering
      const { defaults, schema } = await getCollectionFieldDefaults(slug)
      setFieldSchema(schema)

      if (docId === 'create') {
        setDoc({})
        setFormData(defaults)
      } else {
        const res = await fetch(`/api/${slug}/${docId}`)
        if (res.ok) {
          const data = await res.json()
          setDoc(data)
          // Merge schema keys with doc data (ensures all fields are present)
          setFormData({ ...defaults, ...data })
        }
      }
    } catch (err) {
      console.error('Fetch doc error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [slug, docId])

  useEffect(() => { fetchDoc() }, [fetchDoc])

  // Show toast
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Save handler (POST for create, PATCH for edit)
  const handleSave = async () => {
    if (!slug) return
    setIsSaving(true)
    try {
      const url = isCreate ? `/api/${slug}` : `/api/${slug}/${docId}`
      const method = isCreate ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const result = await res.json()
        if (isCreate) {
          const newId = result.doc?.id || result.id
          showToast('Створено успішно')
          router.push(`/admin/collections/${slug}/${newId}`)
        } else {
          setDoc(result.doc || result)
          showToast('Збережено успішно')
          setTimeout(() => {
            router.push(`/admin/collections/${slug}`)
          }, 600)
        }
      } else {
        const err = await res.json().catch(() => null)
        showToast(err?.message || (isCreate ? 'Помилка створення' : 'Помилка збереження'), 'error')
      }
    } catch {
      showToast(isCreate ? 'Помилка створення' : 'Помилка збереження', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!window.confirm('Видалити цей документ?')) return
    const result = await deleteCollectionDoc(slug, docId)
    if (result.success) {
      router.push(`/admin/collections/${slug}`)
    } else {
      showToast(result.error || 'Помилка видалення', 'error')
    }
  }

  // Duplicate handler
  const handleDuplicate = async () => {
    try {
      const body = { ...formData }
      delete body.id
      delete body.createdAt
      delete body.updatedAt
      const res = await fetch(`/api/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        const created = await res.json()
        router.push(`/admin/collections/${slug}/${created.doc?.id || created.id}`)
      } else {
        showToast('Помилка дублювання', 'error')
      }
    } catch {
      showToast('Помилка дублювання', 'error')
    }
  }

  // Field change handler
  const handleChange = (key: string, val: any) => {
    setFormData((prev) => ({ ...prev, [key]: val }))
  }

  if (isLoading) return <EditSkeleton />
  if (!doc) {
    return (
      <div className="hl-edit-view">
        <div className="hl-empty-state">
          <div className="hl-empty-state__title">Документ не знайдено</div>
          <button className="hl-btn hl-btn--secondary" onClick={() => router.push(`/admin/collections/${slug}`)}>
            Повернутись до списку
          </button>
        </div>
      </div>
    )
  }

  // Split fields into main and sidebar, filtering out hidden fields
  const allKeys = Object.keys(formData).filter((k) => {
    if (SKIP_FIELDS.has(k)) return false
    const meta = fieldSchema.find((f) => f.name === k)
    if (meta?.hidden) return false
    return true
  })
  const sidebarKeys = allKeys.filter((k) => {
    const meta = fieldSchema.find((f) => f.name === k)
    return SIDEBAR_FIELDS.has(k) || meta?.position === 'sidebar'
  })
  const mainKeys = allKeys.filter((k) => !sidebarKeys.includes(k))

  const title = isCreate
    ? `Новий: ${COLLECTION_LABELS[slug] || slug}`
    : (formData.title || formData.name || formData.email || `${COLLECTION_LABELS[slug] || slug} #${docId}`)

  return (
    <div className="hl-edit-view">
      {/* Header */}
      <div className="hl-edit-header">
        <div>
          <button
            className="hl-edit-header__back"
            onClick={() => router.push(`/admin/collections/${slug}`)}
          >
            <IconArrowLeft /> Назад до {COLLECTION_LABELS[slug] || slug}
          </button>
          <div className="hl-edit-header__title" style={{ marginTop: 8 }}>{title}</div>
        </div>
        <div className="hl-edit-header__actions">
          <button className="hl-btn hl-btn--primary" onClick={handleSave} disabled={isSaving}>
            <IconSave /> {isSaving ? (isCreate ? 'Створення...' : 'Збереження...') : (isCreate ? 'Створити' : 'Зберегти')}
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="hl-edit-layout">
        {/* Main content */}
        <div>
          <FieldGroup title={isCreate ? 'Заповніть поля' : 'Основні поля'}>
            {mainKeys.map((key) => {
              const meta = fieldSchema.find((f) => f.name === key)
              return renderField(key, formData[key], handleChange, meta)
            })}
          </FieldGroup>
        </div>

        {/* Sidebar */}
        <div>
          <SidebarMeta
            doc={doc}
            status={formData.status}
            onStatusChange={formData.status !== undefined ? (v) => handleChange('status', v) : undefined}
            isCreate={isCreate}
            extraFields={sidebarKeys
              .filter((k) => k !== 'status')
              .map((k) => {
                const meta = fieldSchema.find((f) => f.name === k)
                // For select fields, show option label instead of raw value
                let displayValue: React.ReactNode
                if (meta?.options) {
                  const opt = meta.options.find((o) => o.value === formData[k])
                  displayValue = opt?.label || String(formData[k] ?? '—')
                } else if (typeof formData[k] === 'boolean' || meta?.type === 'checkbox') {
                  displayValue = (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!formData[k]}
                        onChange={(e) => handleChange(k, e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: 'var(--hl-primary, #6366f1)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: 12 }}>{formData[k] ? 'Так' : 'Ні'}</span>
                    </label>
                  )
                } else {
                  displayValue = String(formData[k] ?? '—')
                }
                return { label: meta?.label || k, value: displayValue }
              })}
          />
          {!isCreate && (
            <div style={{ marginTop: 16 }}>
              <QuickActions
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`hl-toast hl-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}
