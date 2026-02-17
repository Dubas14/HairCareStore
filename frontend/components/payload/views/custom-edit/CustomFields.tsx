'use client'

import React, { useRef, useState } from 'react'

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

export function Field({ label, required, children }: FieldProps) {
  return (
    <div className="hl-field">
      <label className="hl-field__label">
        {label}
        {required && <span style={{ color: '#d4a5a5', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

interface InputProps {
  label: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function StyledInput({ label, value, onChange, type = 'text', placeholder, required, disabled }: InputProps) {
  return (
    <Field label={label} required={required}>
      <input
        className="hl-field__input"
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={disabled ? { background: 'var(--color-base-50)', color: 'var(--color-base-400)' } : undefined}
      />
    </Field>
  )
}

interface TextareaProps {
  label: string
  value: string
  onChange: (val: string) => void
  rows?: number
  placeholder?: string
  required?: boolean
}

export function StyledTextarea({ label, value, onChange, rows = 4, placeholder, required }: TextareaProps) {
  return (
    <Field label={label} required={required}>
      <textarea
        className="hl-field__textarea"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
    </Field>
  )
}

interface SelectProps {
  label: string
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  required?: boolean
}

export function StyledSelect({ label, value, onChange, options, required }: SelectProps) {
  return (
    <Field label={label} required={required}>
      <select
        className="hl-field__select"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Обрати —</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </Field>
  )
}

interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}

export function StyledCheckbox({ label, checked, onChange }: CheckboxProps) {
  return (
    <div className="hl-field__checkbox-wrap">
      <input
        className="hl-field__checkbox"
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span style={{ fontSize: 14, color: 'var(--color-base-700)' }}>{label}</span>
    </div>
  )
}

interface FieldGroupProps {
  title?: string
  children: React.ReactNode
}

export function FieldGroup({ title, children }: FieldGroupProps) {
  return (
    <div className="hl-field-group">
      {title && <div className="hl-field-group__title">{title}</div>}
      {children}
    </div>
  )
}

interface FieldRowProps {
  children: React.ReactNode
}

export function FieldRow({ children }: FieldRowProps) {
  return (
    <div className="hl-field-group__row">{children}</div>
  )
}

// ─── Upload Field ────────────────────────────────────────────────────────────

interface UploadProps {
  label: string
  /** Current value: media object (with url/filename) or media ID or null */
  value: any
  onChange: (val: any) => void
  relationTo?: string
}

export function StyledUpload({ label, value, onChange, relationTo = 'media' }: UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Resolve preview URL from value
  const mediaUrl = resolvePreviewUrl(value)
  const mediaFilename = resolveFilename(value)
  const mediaId = typeof value === 'object' && value !== null ? (value.id ?? null) : (typeof value === 'string' || typeof value === 'number' ? value : null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', file.name)
      const res = await fetch(`/api/${relationTo}`, {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        const result = await res.json()
        const doc = result.doc || result
        onChange(doc)
      }
    } catch (err) {
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleRemove() {
    onChange(null)
  }

  return (
    <Field label={label}>
      {mediaUrl ? (
        <div className="hl-upload-preview">
          <img
            src={mediaUrl}
            alt={mediaFilename || label}
            className="hl-upload-preview__img"
          />
          <div className="hl-upload-preview__info">
            <div className="hl-upload-preview__name">{mediaFilename || `ID: ${mediaId}`}</div>
            <div className="hl-upload-preview__actions">
              <button
                type="button"
                className="hl-btn hl-btn--secondary hl-btn--sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Замінити
              </button>
              <button
                type="button"
                className="hl-btn hl-btn--danger hl-btn--sm"
                onClick={handleRemove}
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="hl-upload-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="hl-upload-zone__icon">
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div className="hl-upload-zone__text">
            {isUploading ? 'Завантаження...' : 'Натисніть для завантаження'}
          </div>
          <div className="hl-upload-zone__hint">PNG, JPG, WebP, SVG</div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </Field>
  )
}

function resolvePreviewUrl(value: any): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null) {
    return value.url || value.thumbnailURL || null
  }
  return null
}

function resolveFilename(value: any): string | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null) {
    return value.filename || value.alt || null
  }
  return null
}
