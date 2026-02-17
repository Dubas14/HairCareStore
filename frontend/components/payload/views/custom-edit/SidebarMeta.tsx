'use client'

import React from 'react'

const UK_MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня']

function formatFullDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const hours = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hours}:${mins}`
}

interface SidebarMetaProps {
  doc: any
  status?: string
  onStatusChange?: (val: string) => void
  statusOptions?: { value: string; label: string }[]
  extraFields?: { label: string; value: React.ReactNode }[]
  isCreate?: boolean
}

export function SidebarMeta({ doc, status, onStatusChange, statusOptions, extraFields, isCreate }: SidebarMetaProps) {
  const defaultStatusOptions = [
    { value: 'active', label: 'Активний' },
    { value: 'draft', label: 'Чернетка' },
    { value: 'archived', label: 'Архів' },
  ]

  const opts = statusOptions || defaultStatusOptions

  return (
    <div className="hl-sidebar-meta">
      <div className="hl-sidebar-meta__title">{isCreate ? 'Новий документ' : 'Метадані'}</div>

      {/* ID — hide for create mode */}
      {!isCreate && (
        <div className="hl-sidebar-meta__row">
          <span className="hl-sidebar-meta__key">ID</span>
          <span className="hl-sidebar-meta__value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
            {doc?.id || '—'}
          </span>
        </div>
      )}

      {/* Status */}
      {status !== undefined && onStatusChange && (
        <div className="hl-sidebar-meta__row">
          <span className="hl-sidebar-meta__key">Статус</span>
          <select
            className="hl-field__select"
            style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            {opts.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Dates — hide for create mode */}
      {!isCreate && (
        <>
          <div className="hl-sidebar-meta__row">
            <span className="hl-sidebar-meta__key">Створено</span>
            <span className="hl-sidebar-meta__value">{formatFullDate(doc?.createdAt)}</span>
          </div>
          <div className="hl-sidebar-meta__row">
            <span className="hl-sidebar-meta__key">Оновлено</span>
            <span className="hl-sidebar-meta__value">{formatFullDate(doc?.updatedAt)}</span>
          </div>
        </>
      )}

      {/* Extra fields */}
      {extraFields?.map((f, i) => (
        <div key={i} className="hl-sidebar-meta__row">
          <span className="hl-sidebar-meta__key">{f.label}</span>
          <span className="hl-sidebar-meta__value">{f.value}</span>
        </div>
      ))}
    </div>
  )
}

interface QuickActionsProps {
  onPreview?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export function QuickActions({ onPreview, onDuplicate, onDelete }: QuickActionsProps) {
  return (
    <div className="hl-sidebar-meta__actions">
      {onPreview && (
        <button className="hl-btn hl-btn--secondary hl-btn--sm" onClick={onPreview} style={{ flex: 1 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Перегляд
        </button>
      )}
      {onDuplicate && (
        <button className="hl-btn hl-btn--secondary hl-btn--sm" onClick={onDuplicate} style={{ flex: 1 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Копія
        </button>
      )}
      {onDelete && (
        <button className="hl-btn hl-btn--danger hl-btn--sm" onClick={onDelete} style={{ flex: 1 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Видалити
        </button>
      )}
    </div>
  )
}
