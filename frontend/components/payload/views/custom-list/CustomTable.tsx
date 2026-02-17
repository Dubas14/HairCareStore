'use client'

import React from 'react'

export interface Column {
  key: string
  label: string
  width?: string
  render?: (value: any, doc: any) => React.ReactNode
}

interface CustomTableProps {
  docs: any[]
  columns: Column[]
  onRowClick?: (doc: any) => void
  onDelete?: (id: string | number) => void
  isLoading?: boolean
}

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
)

const UK_MONTHS = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру']

function formatDate(val: any): string {
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function renderDefault(value: any): React.ReactNode {
  if (value === null || value === undefined) return '\u2014'
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні'
  if (typeof value === 'string' && /^\\d{4}-\\d{2}-\\d{2}/.test(value)) return formatDate(value)
  if (typeof value === 'object' && value.title) return value.title
  if (typeof value === 'object' && value.name) return value.name
  return String(value)
}

export const CustomTable: React.FC<CustomTableProps> = ({
  docs, columns, onRowClick, onDelete, isLoading,
}) => {
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="hl-skeleton hl-skeleton--row" style={{ marginBottom: 6 }} />
        ))}
      </div>
    )
  }

  if (!docs.length) {
    return (
      <div style={{
        padding: '48px 24px', textAlign: 'center', color: 'var(--color-base-400)', fontSize: 14,
        background: 'var(--color-base-50)', borderRadius: 16, border: '1px dashed var(--color-base-200)', marginTop: 16,
      }}>
        <p style={{ marginBottom: 8 }}>Документів не знайдено</p>
        <p style={{ fontSize: 13 }}>Спробуйте змінити фільтри або створити новий документ</p>
      </div>
    )
  }

  return (
    <table className="hl-custom-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} style={col.width ? { width: col.width } : undefined}>{col.label}</th>
          ))}
          {onDelete && <th style={{ width: '80px' }} />}
        </tr>
      </thead>
      <tbody>
        {docs.map((doc) => (
          <tr key={doc.id} onClick={() => onRowClick?.(doc)}>
            {columns.map((col) => (
              <td key={col.key}>
                {col.render ? col.render(doc[col.key], doc) : renderDefault(doc[col.key])}
              </td>
            ))}
            {onDelete && (
              <td>
                <div className="hl-custom-table__actions">
                  <button title="Редагувати" onClick={(e) => { e.stopPropagation(); onRowClick?.(doc) }}>
                    <EditIcon />
                  </button>
                  <button className="hl-delete-btn" title="Видалити" onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm('Видалити цей документ?')) onDelete(doc.id)
                  }}>
                    <TrashIcon />
                  </button>
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
