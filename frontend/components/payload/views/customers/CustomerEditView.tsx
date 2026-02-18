'use client'

/**
 * CustomerEditView — Custom root edit view for the Customers collection.
 *
 * Registered in Customers.ts as:
 *   admin.components.views.edit.root.Component
 *
 * Follows the exact same design system as ProductEditView:
 *   - Inline styles only (no CSS modules)
 *   - Same color palette constants (C.sea500, C.bgCard, etc.)
 *   - Same card/input/label styles
 *   - Same sticky header with breadcrumb + save button
 *   - Same 2-column layout (2fr 1fr)
 *   - Same toast notification pattern
 *   - Same shimmer skeleton
 *
 * Usage (Customers.ts):
 *   admin: {
 *     components: {
 *       views: {
 *         edit: {
 *           root: {
 *             Component: '/components/payload/views/customers/CustomerEditView',
 *           },
 *         },
 *       },
 *     },
 *   },
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCleanPayloadUrl } from '../useCleanPayloadUrl'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Address {
  id?: string
  firstName: string
  lastName: string
  phone: string
  city: string
  address1: string
  countryCode: string
  postalCode: string
  isDefaultShipping: boolean
}

interface WishlistProduct {
  id: string | number
  title?: string
  handle?: string
}

interface CustomerForm {
  firstName: string
  lastName: string
  phone: string
  addresses: Address[]
  wishlist: WishlistProduct[]
  metadata: string
}

interface CustomerDoc {
  id?: string | number
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  addresses?: any[]
  wishlist?: any[]
  metadata?: any
  createdAt?: string
  updatedAt?: string
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants / Palette  (identical to ProductEditView)
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bgPrimary:    'var(--color-base-50)',
  bgSecondary:  'var(--color-base-50)',
  bgCard:       'var(--color-base-0)',
  border:       'var(--color-base-200)',
  sea400:       '#7dd3d3',
  sea500:       '#5bc4c4',
  sea600:       '#4a9e9e',
  textPrimary:  'var(--color-base-700)',
  textSecondary:'var(--color-base-500)',
  textMuted:    'var(--color-base-400)',
  labelColor:   'var(--color-base-600)',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// Shared style helpers  (identical to ProductEditView)
// ─────────────────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background:   C.bgCard,
  border:       `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow:    '0 2px 12px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.02)',
  padding:      24,
  marginBottom: 24,
  transition:   'box-shadow 0.3s ease',
}

const inputStyle: React.CSSProperties = {
  background:   C.bgSecondary,
  border:       `1px solid ${C.border}`,
  borderRadius: 12,
  padding:      '12px 16px',
  color:        C.textPrimary,
  fontSize:     14,
  width:        '100%',
  outline:      'none',
  transition:   'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
  boxSizing:    'border-box',
}

const labelStyle: React.CSSProperties = {
  display:      'block',
  color:        C.labelColor,
  fontWeight:   500,
  fontSize:     14,
  marginBottom: 8,
}

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: 20,
}

const cardTitleStyle: React.CSSProperties = {
  fontSize:      15,
  fontWeight:    600,
  color:         C.textPrimary,
  marginBottom:  20,
  paddingBottom: 12,
  borderBottom:  `1px solid ${C.bgSecondary}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

const UK_MONTHS = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
]

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h}:${m}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────────────────────────────────────

function defaultAddress(): Address {
  return {
    firstName:         '',
    lastName:          '',
    phone:             '',
    city:              '',
    address1:          '',
    countryCode:       'ua',
    postalCode:        '',
    isDefaultShipping: false,
  }
}

function defaultForm(): CustomerForm {
  return {
    firstName: '',
    lastName:  '',
    phone:     '',
    addresses: [],
    wishlist:  [],
    metadata:  '',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Map API response → form state
// ─────────────────────────────────────────────────────────────────────────────

function mapDocToForm(doc: CustomerDoc): CustomerForm {
  const addresses: Address[] = Array.isArray(doc.addresses)
    ? doc.addresses.map((a: any) => ({
        id:                a.id,
        firstName:         a.firstName ?? '',
        lastName:          a.lastName ?? '',
        phone:             a.phone ?? '',
        city:              a.city ?? '',
        address1:          a.address1 ?? '',
        countryCode:       a.countryCode ?? 'ua',
        postalCode:        a.postalCode ?? '',
        isDefaultShipping: a.isDefaultShipping ?? false,
      }))
    : []

  const wishlist: WishlistProduct[] = Array.isArray(doc.wishlist)
    ? doc.wishlist.map((p: any) => {
        if (typeof p === 'object' && p !== null) {
          return { id: p.id, title: p.title, handle: p.handle }
        }
        return { id: p }
      })
    : []

  let metadata = ''
  if (doc.metadata != null) {
    try {
      metadata = typeof doc.metadata === 'string'
        ? doc.metadata
        : JSON.stringify(doc.metadata, null, 2)
    } catch {
      metadata = ''
    }
  }

  return {
    firstName: doc.firstName ?? '',
    lastName:  doc.lastName ?? '',
    phone:     doc.phone ?? '',
    addresses,
    wishlist,
    metadata,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Build request body for save
// ─────────────────────────────────────────────────────────────────────────────

function buildBody(form: CustomerForm): Record<string, any> {
  const addresses = form.addresses.map((a) => ({
    ...(a.id ? { id: a.id } : {}),
    firstName:         a.firstName,
    lastName:          a.lastName,
    phone:             a.phone || undefined,
    city:              a.city,
    address1:          a.address1,
    countryCode:       a.countryCode || 'ua',
    postalCode:        a.postalCode || undefined,
    isDefaultShipping: a.isDefaultShipping,
  }))

  let metadata: any = undefined
  if (form.metadata.trim()) {
    try {
      metadata = JSON.parse(form.metadata)
    } catch {
      metadata = form.metadata
    }
  }

  return {
    firstName: form.firstName,
    lastName:  form.lastName,
    phone:     form.phone || undefined,
    addresses,
    metadata,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons  (same style as ProductEditView)
// ─────────────────────────────────────────────────────────────────────────────

function IconChevronLeft({ size = 16, color = C.textSecondary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconTrash({ size = 16, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function IconPlus({ size = 16, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconUser({ size = 18, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconMapPin({ size = 18, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IconHeart({ size = 18, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function IconCode({ size = 18, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function IconChevronDown({ size = 16, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function IconChevronUp({ size = 16, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function IconExternalLink({ size = 13, color = C.sea600 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function IconStar({ size = 14, color = '#f59e0b' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable UI primitives  (same patterns as ProductEditView)
// ─────────────────────────────────────────────────────────────────────────────

function FieldGroup({
  label,
  required,
  children,
  helper,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  helper?: string
}) {
  return (
    <div style={fieldGroupStyle}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: C.sea600, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {helper && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: C.textMuted }}>{helper}</p>
      )}
    </div>
  )
}

function StyledInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      style={{
        ...inputStyle,
        borderColor: focused ? C.sea400 : C.border,
        boxShadow:   focused ? `0 0 0 3px rgba(91,196,196,0.15)` : 'none',
        background:  disabled
          ? 'var(--color-base-100)'
          : focused ? C.bgCard : C.bgSecondary,
        color:       disabled ? C.textMuted : C.textPrimary,
        cursor:      disabled ? 'not-allowed' : 'text',
      }}
      onFocus={() => !disabled && setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  fontFamily,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  fontFamily?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        resize:      'vertical',
        fontFamily:  fontFamily ?? 'inherit',
        lineHeight:  1.6,
        borderColor: focused ? C.sea400 : C.border,
        boxShadow:   focused ? `0 0 0 3px rgba(91,196,196,0.15)` : 'none',
        background:  focused ? C.bgCard : C.bgSecondary,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton  (same shimmer animation as ProductEditView)
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonBlock({ width = '100%', height = 40 }: { width?: string | number; height?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width,
        height,
        background:     'linear-gradient(90deg, var(--color-base-100) 25%, var(--color-base-200) 50%, var(--color-base-100) 75%)',
        backgroundSize: '200% 100%',
        borderRadius:   10,
        animation:      'shimmer 1.4s infinite',
      }}
    />
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonBlock height={56} />
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap:                 24,
        }}
      >
        {/* Left column skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <SkeletonBlock height={20} width={180} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <SkeletonBlock height={44} />
                <SkeletonBlock height={44} />
              </div>
              <SkeletonBlock height={44} />
              <SkeletonBlock height={44} />
            </div>
          </div>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <SkeletonBlock height={20} width={160} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonBlock height={120} />
              <SkeletonBlock height={120} />
            </div>
          </div>
        </div>
        {/* Right column skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <SkeletonBlock height={20} width={130} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonBlock height={28} />
              <SkeletonBlock height={28} />
              <SkeletonBlock height={28} />
            </div>
          </div>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <SkeletonBlock height={20} width={140} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <SkeletonBlock height={36} />
              <SkeletonBlock height={36} />
              <SkeletonBlock height={36} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast  (identical to ProductEditView)
// ─────────────────────────────────────────────────────────────────────────────

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const isSuccess = toast.type === 'success'
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position:     'fixed',
        top:          24,
        right:        24,
        zIndex:       9999,
        background:   isSuccess ? '#ecfdf5' : '#fef2f2',
        border:       `1px solid ${isSuccess ? '#6ee7b7' : '#fca5a5'}`,
        borderRadius: 12,
        padding:      '14px 20px',
        display:      'flex',
        alignItems:   'center',
        gap:          10,
        boxShadow:    '0 8px 24px rgba(0,0,0,0.12)',
        fontSize:     14,
        color:        isSuccess ? '#065f46' : '#991b1b',
        fontWeight:   500,
        maxWidth:     360,
        animation:    'slideIn 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: 18 }}>{isSuccess ? '✓' : '✕'}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onDismiss}
        aria-label="Закрити повідомлення"
        style={{
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          color:      'inherit',
          opacity:    0.6,
          fontSize:   16,
          lineHeight: 1,
          padding:    '0 0 0 8px',
        }}
      >
        ×
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AddressCard — collapsible address editor
// ─────────────────────────────────────────────────────────────────────────────

function AddressCard({
  address,
  index,
  isDefault,
  onChange,
  onRemove,
  onSetDefault,
}: {
  address: Address
  index: number
  isDefault: boolean
  onChange: (index: number, updated: Address) => void
  onRemove: (index: number) => void
  onSetDefault: (index: number) => void
}) {
  const [expanded, setExpanded] = useState(index === 0)
  const [removeBtnHovered, setRemoveBtnHovered] = useState(false)

  const set = (key: keyof Address, value: string | boolean) =>
    onChange(index, { ...address, [key]: value })

  const summary = [address.city, address.address1]
    .filter(Boolean)
    .join(', ') || `Адреса ${index + 1}`

  return (
    <div
      style={{
        background:   C.bgSecondary,
        border:       `1px solid ${isDefault ? C.sea400 : C.border}`,
        borderRadius: 12,
        marginBottom: 12,
        overflow:     'hidden',
        transition:   'border-color 0.2s',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '12px 16px',
          cursor:         'pointer',
          userSelect:     'none',
        }}
        onClick={() => setExpanded((p) => !p)}
        role="button"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Згорнути' : 'Розгорнути'} адресу ${index + 1}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          {isDefault && (
            <span
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          4,
                padding:      '2px 8px',
                borderRadius: 6,
                fontSize:     11,
                fontWeight:   600,
                background:   `${C.sea500}1a`,
                color:        C.sea600,
                flexShrink:   0,
              }}
            >
              <IconStar size={10} color={C.sea500} />
              Основна
            </span>
          )}
          <span
            style={{
              fontSize:     13,
              fontWeight:   500,
              color:        C.textPrimary,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {summary}
          </span>
        </div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {!isDefault && (
            <button
              type="button"
              onClick={() => onSetDefault(index)}
              title="Зробити основною"
              aria-label="Зробити основною адресою доставки"
              style={{
                background:   C.bgCard,
                border:       `1px solid ${C.border}`,
                borderRadius: 7,
                padding:      '4px 10px',
                cursor:       'pointer',
                fontSize:     11,
                color:        C.textSecondary,
                fontWeight:   500,
                whiteSpace:   'nowrap',
              }}
            >
              Основна
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Видалити адресу ${index + 1}`}
            onMouseEnter={() => setRemoveBtnHovered(true)}
            onMouseLeave={() => setRemoveBtnHovered(false)}
            style={{
              background:   removeBtnHovered ? '#fee2e2' : C.bgCard,
              border:       `1px solid ${removeBtnHovered ? '#fca5a5' : C.border}`,
              borderRadius: 7,
              padding:      '5px 8px',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              transition:   'background 0.2s, border-color 0.2s',
            }}
          >
            <IconTrash size={13} color={removeBtnHovered ? '#dc2626' : C.textMuted} />
          </button>
          <div style={{ color: C.textMuted, display: 'flex', alignItems: 'center' }}>
            {expanded ? <IconChevronUp size={15} /> : <IconChevronDown size={15} />}
          </div>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div
          style={{
            padding:    '4px 16px 16px',
            borderTop:  `1px solid ${C.border}`,
          }}
        >
          {/* Row: firstName + lastName */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
            <FieldGroup label="Ім'я" required>
              <StyledInput
                value={address.firstName}
                onChange={(v) => set('firstName', v)}
                placeholder="Ім'я"
                required
              />
            </FieldGroup>
            <FieldGroup label="Прізвище" required>
              <StyledInput
                value={address.lastName}
                onChange={(v) => set('lastName', v)}
                placeholder="Прізвище"
                required
              />
            </FieldGroup>
          </div>

          {/* Row: phone + city */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FieldGroup label="Телефон">
              <StyledInput
                value={address.phone}
                onChange={(v) => set('phone', v)}
                placeholder="+380XXXXXXXXX"
                type="tel"
              />
            </FieldGroup>
            <FieldGroup label="Місто" required>
              <StyledInput
                value={address.city}
                onChange={(v) => set('city', v)}
                placeholder="Київ"
                required
              />
            </FieldGroup>
          </div>

          {/* Address1 */}
          <FieldGroup
            label="Відділення Нової Пошти"
            required
            helper="Наприклад: Відділення №1 (до 30 кг)"
          >
            <StyledInput
              value={address.address1}
              onChange={(v) => set('address1', v)}
              placeholder="Відділення №1"
              required
            />
          </FieldGroup>

          {/* Row: countryCode + postalCode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <FieldGroup label="Код країни">
              <StyledInput
                value={address.countryCode}
                onChange={(v) => set('countryCode', v.toLowerCase())}
                placeholder="ua"
              />
            </FieldGroup>
            <FieldGroup label="Поштовий індекс">
              <StyledInput
                value={address.postalCode}
                onChange={(v) => set('postalCode', v)}
                placeholder="01001"
              />
            </FieldGroup>
          </div>

          {/* isDefaultShipping checkbox */}
          <label
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        10,
              cursor:     'pointer',
              marginTop:  4,
            }}
          >
            <input
              type="checkbox"
              checked={address.isDefaultShipping}
              onChange={(e) => {
                set('isDefaultShipping', e.target.checked)
                if (e.target.checked) onSetDefault(index)
              }}
              style={{ width: 16, height: 16, accentColor: C.sea500 }}
            />
            <span style={{ fontSize: 14, color: C.labelColor, fontWeight: 500 }}>
              За замовчуванням
            </span>
          </label>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Meta info row component (right sidebar)
// ─────────────────────────────────────────────────────────────────────────────

function MetaRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div
      style={{
        display:       'flex',
        justifyContent:'space-between',
        alignItems:    'flex-start',
        gap:           12,
        padding:       '8px 0',
        borderBottom:  `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontSize: 12, color: C.textMuted, flexShrink: 0 }}>{label}</span>
      <span
        style={{
          fontSize:    12,
          color:       C.textSecondary,
          fontWeight:  500,
          fontFamily:  mono ? 'monospace' : 'inherit',
          textAlign:   'right',
          wordBreak:   'break-all',
        }}
      >
        {value}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CustomerEditView
// ─────────────────────────────────────────────────────────────────────────────

export default function CustomerEditView() {
  useCleanPayloadUrl()

  const [docId, setDocId] = useState<string>('')
  const [doc, setDoc]   = useState<CustomerDoc | null>(null)
  const [form, setForm] = useState<CustomerForm>(defaultForm())
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<Toast | null>(null)

  // Hover states for interactive cards / buttons (same as ProductEditView)
  const [hoveredCard, setHoveredCard]               = useState<string | null>(null)
  const [deleteBtnHovered, setDeleteBtnHovered]     = useState(false)
  const [addAddrBtnHovered, setAddAddrBtnHovered]   = useState(false)

  const isCreate = docId === 'create'

  // ── Inject global keyframe animations once ───────────────────────────────
  const animInjected = useRef(false)
  useEffect(() => {
    if (animInjected.current) return
    animInjected.current = true
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        from { background-position: 200% 0; }
        to   { background-position: -200% 0; }
      }
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
    `
    document.head.appendChild(style)
  }, [])

  // ── Extract docId from URL ───────────────────────────────────────────────
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/admin\/collections\/customers\/([^/?#]+)/)
    if (match) setDocId(match[1])
  }, [])

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((message: string, type: Toast['type']) => {
    setToast({ message, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  // ── Fetch customer data ──────────────────────────────────────────────────
  const fetchCustomer = useCallback(async () => {
    if (!docId) return
    setLoading(true)
    try {
      if (docId === 'create') {
        setDoc({})
        setForm(defaultForm())
      } else {
        const res = await fetch(`/api/customers/${docId}?depth=1`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: CustomerDoc = await res.json()
        setDoc(data)
        setForm(mapDocToForm(data))
      }
    } catch (err) {
      console.error('Failed to load customer:', err)
      showToast('Не вдалося завантажити дані клієнта', 'error')
      setDoc(null)
    } finally {
      setLoading(false)
    }
  }, [docId, showToast])

  useEffect(() => { fetchCustomer() }, [fetchCustomer])

  // ── Field helpers ────────────────────────────────────────────────────────
  const setField = useCallback(
    <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  )

  // ── Address handlers ─────────────────────────────────────────────────────
  const handleAddAddress = useCallback(() => {
    setForm((prev) => {
      if (prev.addresses.length >= 5) return prev
      return { ...prev, addresses: [...prev.addresses, defaultAddress()] }
    })
  }, [])

  const handleAddressChange = useCallback((index: number, updated: Address) => {
    setForm((prev) => {
      const addresses = [...prev.addresses]
      addresses[index] = updated
      return { ...prev, addresses }
    })
  }, [])

  const handleAddressRemove = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }))
  }, [])

  const handleSetDefault = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      addresses: prev.addresses.map((a, i) => ({
        ...a,
        isDefaultShipping: i === index,
      })),
    }))
  }, [])

  // ── Save handler ─────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    // Basic validation
    if (!form.firstName.trim()) {
      showToast("Ім'я є обов'язковим", 'error')
      return
    }
    if (!form.lastName.trim()) {
      showToast("Прізвище є обов'язковим", 'error')
      return
    }
    // Validate each address
    for (let i = 0; i < form.addresses.length; i++) {
      const a = form.addresses[i]
      if (!a.firstName.trim() || !a.lastName.trim() || !a.city.trim() || !a.address1.trim()) {
        showToast(`Адреса ${i + 1}: заповніть усі обов'язкові поля`, 'error')
        return
      }
    }

    setSaving(true)
    try {
      const url    = isCreate ? '/api/customers' : `/api/customers/${docId}`
      const method = isCreate ? 'POST' : 'PATCH'
      const body   = buildBody(form)

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        let message = `HTTP ${res.status}`
        try {
          const json = JSON.parse(text)
          message = json?.errors?.[0]?.message || json?.message || message
        } catch { /* ignore */ }
        throw new Error(message)
      }

      const saved = await res.json()
      if (isCreate && (saved.doc?.id || saved.id)) {
        const newId = saved.doc?.id || saved.id
        showToast('Клієнта створено', 'success')
        setTimeout(() => {
          window.location.href = `/admin/collections/customers/${newId}`
        }, 600)
        return
      }

      showToast('Збережено успішно', 'success')
      setTimeout(() => {
        window.location.href = '/admin/collections/customers'
      }, 600)
    } catch (err: any) {
      console.error('Save error:', err)
      showToast(err?.message || 'Помилка збереження', 'error')
    } finally {
      setSaving(false)
    }
  }, [form, isCreate, docId, showToast])

  // ── Delete handler ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!docId || isCreate) return
    if (!window.confirm('Видалити цього клієнта? Цю дію неможливо скасувати.')) return
    try {
      const res = await fetch(`/api/customers/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      window.location.href = '/admin/collections/customers'
    } catch (err) {
      console.error('Delete error:', err)
      showToast('Помилка видалення', 'error')
    }
  }, [docId, isCreate, showToast])

  // ── Computed display values ──────────────────────────────────────────────
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ') || (isCreate ? 'Новий клієнт' : 'Клієнт')

  // ────────────────────────────────────────────────────────────────────────
  // Loading state
  // ────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color:      C.textPrimary,
          background: C.bgPrimary,
          minHeight:  '100vh',
          padding:    '0 0 48px',
        }}
      >
        {/* Header skeleton */}
        <div
          style={{
            background:   C.bgCard,
            borderBottom: `1px solid ${C.border}`,
            padding:      '14px 24px',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'space-between',
          }}
        >
          <SkeletonBlock width={240} height={28} />
          <SkeletonBlock width={110} height={38} />
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────
  // Not found state
  // ────────────────────────────────────────────────────────────────────────

  if (!isCreate && !doc) {
    return (
      <div
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          color:      C.textPrimary,
          background: C.bgPrimary,
          minHeight:  '100vh',
          display:    'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection:  'column',
          gap:        16,
        }}
      >
        <IconUser size={48} color={C.textMuted} />
        <p style={{ fontSize: 16, color: C.textMuted, margin: 0 }}>Клієнта не знайдено</p>
        <a
          href="/admin/collections/customers"
          style={{
            padding:      '9px 20px',
            borderRadius: 10,
            border:       `1px solid ${C.border}`,
            background:   C.bgCard,
            color:        C.sea600,
            fontSize:     13,
            fontWeight:   600,
            textDecoration: 'none',
            cursor:       'pointer',
          }}
        >
          Повернутись до списку
        </a>
      </div>
    )
  }

  // ────────────────────────────────────────────────────────────────────────
  // Main render
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color:      C.textPrimary,
        background: C.bgPrimary,
        minHeight:  '100vh',
        padding:    '0 0 48px',
      }}
    >
      {/* Toast */}
      {toast && <ToastNotification toast={toast} onDismiss={dismissToast} />}

      {/* ── Sticky header ── */}
      <div
        style={{
          position:       'sticky',
          top:            0,
          zIndex:         100,
          background:     C.bgCard,
          borderBottom:   `1px solid ${C.border}`,
          padding:        '14px 24px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            16,
          flexWrap:       'wrap',
          boxShadow:      '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Навігація" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a
            href="/admin/collections/customers"
            style={{
              color:          C.sea600,
              textDecoration: 'none',
              fontSize:       14,
              fontWeight:     500,
              display:        'flex',
              alignItems:     'center',
              gap:            4,
            }}
          >
            <IconChevronLeft size={15} color={C.sea600} />
            Клієнти
          </a>
          <span style={{ color: C.textMuted, fontSize: 14 }}>/</span>
          <span
            style={{
              fontSize:  14,
              color:     C.textPrimary,
              fontWeight: 600,
              maxWidth:  280,
              overflow:  'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={isCreate ? 'Новий клієнт' : fullName}
          >
            {isCreate ? 'Новий клієнт' : (fullName.length > 36 ? `${fullName.slice(0, 36)}…` : fullName)}
          </span>
        </nav>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-label="Зберегти клієнта"
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          6,
              padding:      '9px 22px',
              borderRadius: 10,
              border:       'none',
              background:   saving
                ? C.textMuted
                : `linear-gradient(135deg, ${C.sea500}, ${C.sea600})`,
              color:        '#fff',
              fontSize:     13,
              fontWeight:   700,
              cursor:       saving ? 'not-allowed' : 'pointer',
              boxShadow:    saving ? 'none' : `0 4px 14px rgba(91,196,196,0.35)`,
              transition:   'all 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {saving ? 'Збереження…' : (isCreate ? 'Створити' : 'Зберегти')}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div
        style={{
          maxWidth:  1200,
          margin:    '0 auto',
          padding:   '24px 24px 0',
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
        {/* Title hero */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <div
              style={{
                width:          48,
                height:         48,
                borderRadius:   '50%',
                background:     `${C.sea500}1a`,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                flexShrink:     0,
              }}
            >
              <IconUser size={22} color={C.sea500} />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: C.textPrimary, lineHeight: 1.2 }}>
                {isCreate ? 'Новий клієнт' : fullName}
              </div>
              {!isCreate && doc?.email && (
                <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{doc.email}</div>
              )}
            </div>
          </div>
        </div>

        {/* 2-column grid */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap:                 24,
            alignItems:          'start',
          }}
        >
          {/* ── Left column ── */}
          <div>

            {/* ── Main Info Card ── */}
            <div
              style={{
                ...cardStyle,
                boxShadow: hoveredCard === 'main'
                  ? '0 8px 30px rgba(91,196,196,0.08)'
                  : cardStyle.boxShadow,
              }}
              onMouseEnter={() => setHoveredCard('main')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h2 style={{ ...cardTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconUser size={16} color={C.sea500} />
                Основна інформація
              </h2>

              {/* firstName + lastName */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FieldGroup label="Ім'я" required>
                  <StyledInput
                    value={form.firstName}
                    onChange={(v) => setField('firstName', v)}
                    placeholder="Іван"
                    required
                  />
                </FieldGroup>
                <FieldGroup label="Прізвище" required>
                  <StyledInput
                    value={form.lastName}
                    onChange={(v) => setField('lastName', v)}
                    placeholder="Петренко"
                    required
                  />
                </FieldGroup>
              </div>

              {/* Email — read-only (managed by Payload auth) */}
              <FieldGroup label="Email">
                <StyledInput
                  value={doc?.email ?? ''}
                  onChange={() => {}}
                  placeholder="—"
                  type="email"
                  disabled
                />
                <p style={{ margin: '6px 0 0', fontSize: 12, color: C.textMuted }}>
                  Email керується системою автентифікації
                </p>
              </FieldGroup>

              {/* Phone */}
              <FieldGroup label="Телефон">
                <StyledInput
                  value={form.phone}
                  onChange={(v) => setField('phone', v)}
                  placeholder="+380XXXXXXXXX"
                  type="tel"
                />
              </FieldGroup>
            </div>

            {/* ── Addresses Card ── */}
            <div
              style={{
                ...cardStyle,
                boxShadow: hoveredCard === 'addresses'
                  ? '0 8px 30px rgba(91,196,196,0.08)'
                  : cardStyle.boxShadow,
              }}
              onMouseEnter={() => setHoveredCard('addresses')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h2
                style={{
                  ...cardTitleStyle,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  gap:            8,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconMapPin size={16} color={C.sea500} />
                  Адреси доставки
                </span>
                <span
                  style={{
                    fontSize:     12,
                    fontWeight:   400,
                    color:        C.textMuted,
                    background:   C.bgSecondary,
                    padding:      '3px 10px',
                    borderRadius: 20,
                    border:       `1px solid ${C.border}`,
                  }}
                >
                  {form.addresses.length} / 5
                </span>
              </h2>

              {/* Address list */}
              {form.addresses.length === 0 ? (
                <div
                  style={{
                    padding:    '32px 0',
                    textAlign:  'center',
                    color:      C.textMuted,
                    fontSize:   13,
                  }}
                >
                  Немає збережених адрес
                </div>
              ) : (
                form.addresses.map((address, idx) => (
                  <AddressCard
                    key={address.id ?? idx}
                    address={address}
                    index={idx}
                    isDefault={address.isDefaultShipping}
                    onChange={handleAddressChange}
                    onRemove={handleAddressRemove}
                    onSetDefault={handleSetDefault}
                  />
                ))
              )}

              {/* Add address button */}
              {form.addresses.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddAddress}
                  aria-label="Додати адресу доставки"
                  onMouseEnter={() => setAddAddrBtnHovered(true)}
                  onMouseLeave={() => setAddAddrBtnHovered(false)}
                  style={{
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            8,
                    width:          '100%',
                    padding:        '10px 0',
                    marginTop:      form.addresses.length > 0 ? 4 : 0,
                    borderRadius:   10,
                    border:         `1.5px dashed ${addAddrBtnHovered ? C.sea400 : C.border}`,
                    background:     addAddrBtnHovered ? `${C.sea400}0d` : 'transparent',
                    color:          addAddrBtnHovered ? C.sea600 : C.textMuted,
                    fontSize:       13,
                    fontWeight:     500,
                    cursor:         'pointer',
                    transition:     'all 0.2s',
                  }}
                >
                  <IconPlus size={14} color={addAddrBtnHovered ? C.sea500 : C.textMuted} />
                  Додати адресу
                </button>
              )}
            </div>

          </div>{/* end left column */}

          {/* ── Right column ── */}
          <div>

            {/* ── Meta Info Card ── */}
            <div
              style={{
                ...cardStyle,
                boxShadow: hoveredCard === 'meta'
                  ? '0 8px 30px rgba(91,196,196,0.08)'
                  : cardStyle.boxShadow,
              }}
              onMouseEnter={() => setHoveredCard('meta')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h2 style={cardTitleStyle}>Мета-інформація</h2>

              {!isCreate && doc ? (
                <>
                  <MetaRow label="ID" value={String(doc.id ?? '—')} mono />
                  <MetaRow label="Створено" value={formatDate(doc.createdAt)} />
                  <MetaRow label="Оновлено" value={formatDate(doc.updatedAt)} />
                  {doc.email && (
                    <MetaRow label="Email" value={doc.email} />
                  )}
                </>
              ) : (
                <p style={{ fontSize: 13, color: C.textMuted, margin: 0 }}>
                  Мета-дані будуть доступні після збереження
                </p>
              )}
            </div>

            {/* ── Wishlist Card ── */}
            <div
              style={{
                ...cardStyle,
                boxShadow: hoveredCard === 'wishlist'
                  ? '0 8px 30px rgba(91,196,196,0.08)'
                  : cardStyle.boxShadow,
              }}
              onMouseEnter={() => setHoveredCard('wishlist')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h2 style={{ ...cardTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconHeart size={16} color={C.sea500} />
                Список бажань
                {form.wishlist.length > 0 && (
                  <span
                    style={{
                      marginLeft:   'auto',
                      fontSize:     12,
                      fontWeight:   400,
                      color:        C.sea600,
                      background:   `${C.sea500}1a`,
                      padding:      '2px 8px',
                      borderRadius: 20,
                    }}
                  >
                    {form.wishlist.length}
                  </span>
                )}
              </h2>

              {form.wishlist.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: C.textMuted, fontSize: 13 }}>
                  Список бажань порожній
                </div>
              ) : (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.wishlist.map((product) => {
                    const name    = product.title ?? `Товар #${product.id}`
                    const href    = product.handle ? `/products/${product.handle}` : null
                    const adminHref = `/admin/collections/products/${product.id}`
                    return (
                      <li
                        key={String(product.id)}
                        style={{
                          display:      'flex',
                          alignItems:   'center',
                          justifyContent: 'space-between',
                          gap:          8,
                          padding:      '8px 10px',
                          background:   C.bgSecondary,
                          borderRadius: 8,
                          border:       `1px solid ${C.border}`,
                          fontSize:     13,
                        }}
                      >
                        <span
                          style={{
                            color:        C.textPrimary,
                            flex:         1,
                            overflow:     'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace:   'nowrap',
                          }}
                          title={name}
                        >
                          {name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {href && (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Переглянути ${name} на сайті`}
                              title="Переглянути на сайті"
                              style={{
                                display:    'flex',
                                alignItems: 'center',
                                color:      C.sea600,
                                opacity:    0.7,
                              }}
                            >
                              <IconExternalLink size={13} color={C.sea600} />
                            </a>
                          )}
                          <a
                            href={adminHref}
                            aria-label={`Редагувати ${name} в адмінпанелі`}
                            title="Редагувати в адмінці"
                            style={{
                              display:    'flex',
                              alignItems: 'center',
                              color:      C.textMuted,
                              opacity:    0.7,
                              fontSize:   11,
                              fontWeight: 500,
                              textDecoration: 'none',
                            }}
                          >
                            Ред.
                          </a>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* ── Metadata Card ── */}
            <div
              style={{
                ...cardStyle,
                boxShadow: hoveredCard === 'metadata'
                  ? '0 8px 30px rgba(91,196,196,0.08)'
                  : cardStyle.boxShadow,
              }}
              onMouseEnter={() => setHoveredCard('metadata')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <h2 style={{ ...cardTitleStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconCode size={16} color={C.sea500} />
                Метадані
              </h2>
              <StyledTextarea
                value={form.metadata}
                onChange={(v) => setField('metadata', v)}
                placeholder={'{\n  "key": "value"\n}'}
                rows={6}
                fontFamily='"JetBrains Mono", "Fira Code", monospace'
              />
              <p style={{ margin: '6px 0 0', fontSize: 12, color: C.textMuted }}>
                JSON-об'єкт або порожньо
              </p>
            </div>

            {/* ── Danger Zone (delete) — edit mode only ── */}
            {!isCreate && (
              <div
                style={{
                  ...cardStyle,
                  boxShadow: hoveredCard === 'danger'
                    ? '0 8px 30px rgba(239,68,68,0.08)'
                    : cardStyle.boxShadow,
                  borderColor: deleteBtnHovered ? '#fca5a5' : C.border,
                  transition:  'box-shadow 0.3s ease, border-color 0.2s',
                }}
                onMouseEnter={() => setHoveredCard('danger')}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <h2 style={cardTitleStyle}>Небезпечна зона</h2>
                <p style={{ fontSize: 13, color: C.textMuted, marginTop: 0, marginBottom: 16 }}>
                  Видалення клієнта є незворотною дією. Всі пов'язані дані залишаться.
                </p>
                <button
                  type="button"
                  onClick={handleDelete}
                  aria-label="Видалити клієнта"
                  onMouseEnter={() => setDeleteBtnHovered(true)}
                  onMouseLeave={() => setDeleteBtnHovered(false)}
                  style={{
                    width:          '100%',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            8,
                    padding:        '11px 0',
                    borderRadius:   10,
                    border:         `1px solid ${deleteBtnHovered ? '#fca5a5' : '#fee2e2'}`,
                    background:     deleteBtnHovered ? '#fef2f2' : C.bgCard,
                    color:          '#dc2626',
                    fontSize:       13,
                    fontWeight:     600,
                    cursor:         'pointer',
                    transition:     'background 0.2s, border-color 0.2s',
                  }}
                >
                  <IconTrash size={15} color="#dc2626" />
                  Видалити клієнта
                </button>
              </div>
            )}

          </div>{/* end right column */}
        </div>
      </div>
    </div>
  )
}
