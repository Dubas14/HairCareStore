'use client'

/**
 * ProductEditView — Custom root edit view for the Products collection.
 *
 * Registered in payload.config.ts as:
 *   collections[products].admin.components.views.edit.root.Component
 *
 * Fetches/saves via Payload REST API (same origin).
 * All styles are inline; no external CSS dependency.
 *
 * Usage example (payload.config.ts):
 *   import { Products } from './collections'
 *   // inside Products collection definition:
 *   admin: {
 *     components: {
 *       views: {
 *         edit: {
 *           root: {
 *             Component: '/components/payload/views/products/ProductEditView',
 *           },
 *         },
 *       },
 *     },
 *   },
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MediaDoc {
  id: string | number
  url?: string
  filename?: string
  alt?: string
}

interface Variant {
  id?: string
  title: string
  sku: string
  price: string
  compareAtPrice: string
  inStock: boolean
  inventory: string
}

interface FormState {
  title: string
  subtitle: string
  description: string
  handle: string
  status: 'draft' | 'active' | 'archived'
  categoryId: string
  brandId: string
  basePrice: string
  salePrice: string
  metaTitle: string
  metaDescription: string
  thumbnail: MediaDoc | null
  variants: Variant[]
}

interface CategoryDoc { id: string | number; title?: string; name?: string }
interface BrandDoc    { id: string | number; title?: string; name?: string }

interface Toast {
  message: string
  type: 'success' | 'error'
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants / Palette
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
// Shared style helpers
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
  fontSize:     15,
  fontWeight:   600,
  color:        C.textPrimary,
  marginBottom: 20,
  paddingBottom: 12,
  borderBottom: `1px solid ${C.bgSecondary}`,
}

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────────────────────────────────────

function FieldGroup({ label, required, children, helper }: {
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
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        ...inputStyle,
        borderColor:  focused ? C.sea400 : C.border,
        boxShadow:    focused ? `0 0 0 3px rgba(91,196,196,0.15)` : 'none',
        background:   focused ? C.bgCard : C.bgSecondary,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function StyledSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputStyle,
        cursor:     'pointer',
        appearance: 'auto',
        borderColor: focused ? C.sea400 : C.border,
        boxShadow:   focused ? `0 0 0 3px rgba(91,196,196,0.15)` : 'none',
        background:  focused ? C.bgCard : C.bgSecondary,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  )
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
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
        fontFamily:  'inherit',
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

// SVG Icons (no external deps)
function IconCloudUpload({ size = 28, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function IconPlus({ size = 20, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconCopy({ size = 16, color = C.sea500 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
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

function IconEye({ size = 16, color = C.textSecondary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconChevronLeft({ size = 16, color = C.textSecondary }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Default form state
// ─────────────────────────────────────────────────────────────────────────────

function defaultForm(): FormState {
  return {
    title:          '',
    subtitle:       '',
    description:    '',
    handle:         '',
    status:         'draft',
    categoryId:     '',
    brandId:        '',
    basePrice:      '',
    salePrice:      '',
    metaTitle:      '',
    metaDescription: '',
    thumbnail:      null,
    variants:       [],
  }
}

function emptyVariant(): Variant {
  return { title: '', sku: '', price: '', compareAtPrice: '', inStock: true, inventory: '0' }
}

// ─────────────────────────────────────────────────────────────────────────────
// Data helpers
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProductToForm(doc: any): FormState {
  const firstVariant = Array.isArray(doc.variants) ? doc.variants[0] : null
  const variants: Variant[] = Array.isArray(doc.variants)
    ? doc.variants.map((v: any) => ({
        id:             v.id,
        title:          v.title ?? '',
        sku:            v.sku ?? '',
        price:          v.price != null ? String(v.price) : '',
        compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : '',
        inStock:        v.inStock ?? true,
        inventory:      v.inventory != null ? String(v.inventory) : '0',
      }))
    : []

  return {
    title:          doc.title ?? '',
    subtitle:       doc.subtitle ?? '',
    description:    typeof doc.description === 'string' ? doc.description : '',
    handle:         doc.handle ?? '',
    status:         doc.status ?? 'draft',
    categoryId:     doc.categories?.[0]?.id != null ? String(doc.categories[0].id) : '',
    brandId:        doc.brand?.id != null ? String(doc.brand.id) : '',
    basePrice:      firstVariant?.price != null ? String(firstVariant.price) : '',
    salePrice:      firstVariant?.compareAtPrice != null ? String(firstVariant.compareAtPrice) : '',
    metaTitle:      doc.metaTitle ?? '',
    metaDescription: doc.metaDescription ?? '',
    thumbnail:      doc.thumbnail ?? null,
    variants,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPayload(form: FormState, isCreate: boolean): Record<string, any> {
  const variants = form.variants.length > 0
    ? form.variants.map((v) => ({
        ...(v.id && !isCreate ? { id: v.id } : {}),
        title:          v.title,
        sku:            v.sku || undefined,
        price:          v.price !== '' ? Number(v.price) : 0,
        compareAtPrice: v.compareAtPrice !== '' ? Number(v.compareAtPrice) : undefined,
        inStock:        v.inStock,
        inventory:      v.inventory !== '' ? Number(v.inventory) : 0,
      }))
    : [{
        title:    form.title || 'Default',
        price:    form.basePrice !== '' ? Number(form.basePrice) : 0,
        compareAtPrice: form.salePrice !== '' ? Number(form.salePrice) : undefined,
        inStock:  true,
        inventory: 0,
      }]

  return {
    title:           form.title,
    subtitle:        form.subtitle || undefined,
    description:     form.description || undefined,
    handle:          form.handle,
    status:          form.status,
    categories:      form.categoryId ? [form.categoryId] : [],
    brand:           form.brandId || undefined,
    thumbnail:       form.thumbnail?.id ?? undefined,
    variants,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonBlock({ width = '100%', height = 40 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, var(--color-base-100) 25%, var(--color-base-200) 50%, var(--color-base-100) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: 10,
        animation: 'shimmer 1.4s infinite',
      }}
      aria-hidden="true"
    />
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SkeletonBlock height={56} />
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <SkeletonBlock height={20} width={160} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SkeletonBlock height={44} />
              <SkeletonBlock height={44} />
              <SkeletonBlock height={160} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ ...cardStyle, marginBottom: 0 }}>
            <SkeletonBlock height={20} width={120} />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <SkeletonBlock height={44} />
              <SkeletonBlock height={44} />
              <SkeletonBlock height={44} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Toast notification
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
// Variant sub-card
// ─────────────────────────────────────────────────────────────────────────────

function VariantCard({
  variant,
  index,
  onChange,
  onRemove,
}: {
  variant: Variant
  index: number
  onChange: (index: number, updated: Variant) => void
  onRemove: (index: number) => void
}) {
  const set = (key: keyof Variant, value: string | boolean) =>
    onChange(index, { ...variant, [key]: value })

  return (
    <div
      style={{
        background:   C.bgSecondary,
        border:       `1px solid ${C.border}`,
        borderRadius: 12,
        padding:      16,
        marginBottom: 12,
        position:     'relative',
      }}
    >
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: C.textSecondary }}>
          Варіант {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          aria-label={`Видалити варіант ${index + 1}`}
          style={{
            background: '#fee2e2',
            border:     '1px solid #fca5a5',
            borderRadius: 8,
            padding:    '4px 10px',
            cursor:     'pointer',
            display:    'flex',
            alignItems: 'center',
            gap:        6,
            fontSize:   12,
            color:      '#dc2626',
            fontWeight: 500,
          }}
        >
          <IconTrash size={13} color="#dc2626" />
          Видалити
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldGroup label="Назва варіанту">
          <StyledInput
            value={variant.title}
            onChange={(v) => set('title', v)}
            placeholder="напр. 250ml"
          />
        </FieldGroup>
        <FieldGroup label="SKU">
          <StyledInput
            value={variant.sku}
            onChange={(v) => set('sku', v)}
            placeholder="SKU-001"
          />
        </FieldGroup>
        <FieldGroup label="Ціна (₴)">
          <StyledInput
            value={variant.price}
            onChange={(v) => set('price', v)}
            type="number"
            placeholder="0"
          />
        </FieldGroup>
        <FieldGroup label="Стара ціна (₴)">
          <StyledInput
            value={variant.compareAtPrice}
            onChange={(v) => set('compareAtPrice', v)}
            type="number"
            placeholder="0"
          />
        </FieldGroup>
        <FieldGroup label="На складі">
          <StyledInput
            value={variant.inventory}
            onChange={(v) => set('inventory', v)}
            type="number"
            placeholder="0"
          />
        </FieldGroup>
        <FieldGroup label="">
          <label
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        10,
              cursor:     'pointer',
              marginTop:  22,
            }}
          >
            <input
              type="checkbox"
              checked={variant.inStock}
              onChange={(e) => set('inStock', e.target.checked)}
              style={{ width: 16, height: 16, accentColor: C.sea500 }}
            />
            <span style={{ fontSize: 14, color: C.labelColor, fontWeight: 500 }}>В наявності</span>
          </label>
        </FieldGroup>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Description toolbar (visual-only, sets plain text)
// ─────────────────────────────────────────────────────────────────────────────

function DescriptionEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const toolbarButtons = [
    { label: 'B', title: 'Жирний', style: { fontWeight: 800 } },
    { label: 'I', title: 'Курсив', style: { fontStyle: 'italic' } },
    { label: 'U', title: 'Підкреслення', style: { textDecoration: 'underline' } },
  ]

  return (
    <div
      style={{
        border:       `1px solid ${focused ? C.sea400 : C.border}`,
        borderRadius: 12,
        overflow:     'hidden',
        boxShadow:    focused ? `0 0 0 3px rgba(91,196,196,0.15)` : 'none',
        transition:   'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            4,
          padding:        '8px 10px',
          background:     C.bgCard,
          borderBottom:   `1px solid ${C.border}`,
        }}
      >
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            title={btn.title}
            aria-label={btn.title}
            style={{
              ...btn.style,
              padding:      '4px 10px',
              borderRadius: 8,
              border:       'none',
              background:   'transparent',
              cursor:       'pointer',
              fontSize:     13,
              color:        C.textPrimary,
              transition:   'background 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${C.sea500}22` }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
          >
            {btn.label}
          </button>
        ))}
        <span
          style={{
            width: 1,
            height: 20,
            background: C.border,
            margin: '0 4px',
          }}
          aria-hidden="true"
        />
        <button
          type="button"
          title="Список"
          aria-label="Маркований список"
          style={{
            padding: '4px 8px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: C.textPrimary,
            fontSize: 13,
          }}
        >
          ≡
        </button>
        <button
          type="button"
          title="Нумерований список"
          aria-label="Нумерований список"
          style={{
            padding: '4px 8px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: C.textPrimary,
            fontSize: 13,
          }}
        >
          1≡
        </button>
        <button
          type="button"
          title="Посилання"
          aria-label="Посилання"
          style={{
            padding: '4px 8px',
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: C.textPrimary,
            fontSize: 13,
          }}
        >
          🔗
        </button>
      </div>
      {/* Content area */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Детальний опис товару..."
        rows={8}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:      '100%',
          padding:    '14px 16px',
          background: C.bgSecondary,
          border:     'none',
          outline:    'none',
          fontSize:   14,
          color:      C.textPrimary,
          lineHeight: 1.7,
          resize:     'vertical',
          fontFamily: 'inherit',
          boxSizing:  'border-box',
        }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Thumbnail upload zone
// ─────────────────────────────────────────────────────────────────────────────

function ThumbnailZone({
  thumbnail,
  onClear,
}: {
  thumbnail: MediaDoc | null
  onClear: () => void
}) {
  const [dragging, setDragging] = useState(false)

  if (thumbnail) {
    const imgUrl = thumbnail.url ?? ''
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt={thumbnail.alt ?? thumbnail.filename ?? 'Мініатюра'}
          style={{
            width:        '100%',
            maxHeight:    240,
            objectFit:    'cover',
            borderRadius: 12,
            border:       `1px solid ${C.border}`,
          }}
        />
        <button
          type="button"
          onClick={onClear}
          aria-label="Видалити мініатюру"
          style={{
            position:     'absolute',
            top:          8,
            right:        8,
            background:   C.bgCard,
            border:       `1px solid ${C.border}`,
            borderRadius: 8,
            padding:      '4px 10px',
            cursor:       'pointer',
            fontSize:     12,
            color:        '#dc2626',
            fontWeight:   500,
          }}
        >
          Видалити
        </button>
      </div>
    )
  }

  return (
    <div
      onDragEnter={() => setDragging(true)}
      onDragLeave={() => setDragging(false)}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDrop={(e) => { e.preventDefault(); setDragging(false) }}
      style={{
        border:         `2px dashed ${dragging ? C.sea400 : C.border}`,
        borderRadius:   16,
        padding:        '40px 24px',
        textAlign:      'center',
        transition:     'border-color 0.2s, background 0.2s',
        background:     dragging ? `${C.sea400}0d` : 'transparent',
      }}
    >
      <div
        style={{
          width:          56,
          height:         56,
          borderRadius:   '50%',
          background:     `${C.sea500}1a`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          margin:         '0 auto 16px',
        }}
      >
        <IconCloudUpload size={28} color={C.sea500} />
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: C.textSecondary }}>
        Перетягніть файл або
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          style={{
            background:   `linear-gradient(135deg, ${C.sea500}, ${C.sea600})`,
            color:        '#fff',
            border:       'none',
            borderRadius: 10,
            padding:      '10px 20px',
            cursor:       'pointer',
            fontSize:     13,
            fontWeight:   600,
          }}
        >
          Створити новий
        </button>
        <button
          type="button"
          style={{
            background:   C.bgCard,
            color:        C.sea600,
            border:       `1px solid ${C.sea400}`,
            borderRadius: 10,
            padding:      '10px 20px',
            cursor:       'pointer',
            fontSize:     13,
            fontWeight:   600,
          }}
        >
          Обрати існуючий
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Character counter
// ─────────────────────────────────────────────────────────────────────────────

function CharCounter({ current, max }: { current: number; max: number }) {
  const overLimit = current > max
  return (
    <span
      style={{
        fontSize:   12,
        color:      overLimit ? '#dc2626' : C.sea600,
        fontWeight: 500,
      }}
      aria-live="polite"
    >
      {current}/{max}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductEditView
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductEditView() {
  // Payload v3 — provides the current document ID when inside an edit view
  const { id: docId } = useDocumentInfo()
  const productId = docId ? String(docId) : null
  const isEditMode = Boolean(productId)

  const [form, setForm] = useState<FormState>(defaultForm())
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [categories, setCategories] = useState<CategoryDoc[]>([])
  const [brands, setBrands] = useState<BrandDoc[]>([])
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [deleteBtnHovered, setDeleteBtnHovered] = useState(false)
  const [dupBtnHovered, setDupBtnHovered] = useState(false)

  const showToast = useCallback((message: string, type: Toast['type']) => {
    setToast({ message, type })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  // Inject global keyframe animations once
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

  // Load dropdown data
  useEffect(() => {
    const base = window.location.origin
    Promise.all([
      fetch(`${base}/api/categories?limit=200`).then((r) => r.json()).catch(() => ({ docs: [] })),
      fetch(`${base}/api/brands?limit=200`).then((r) => r.json()).catch(() => ({ docs: [] })),
    ]).then(([catData, brandData]) => {
      setCategories(catData.docs ?? [])
      setBrands(brandData.docs ?? [])
    })
  }, [])

  // Load product data in edit mode
  useEffect(() => {
    if (!productId) return
    const base = window.location.origin
    fetch(`${base}/api/products/${productId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((doc) => setForm(mapProductToForm(doc)))
      .catch((err) => {
        console.error('Failed to load product:', err)
        showToast('Не вдалося завантажити товар', 'error')
      })
      .finally(() => setLoading(false))
  }, [productId, showToast])

  // Field updaters
  const setField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  )

  // Variant handlers
  const handleVariantChange = useCallback((index: number, updated: Variant) => {
    setForm((prev) => {
      const variants = [...prev.variants]
      variants[index] = updated
      return { ...prev, variants }
    })
  }, [])

  const handleVariantRemove = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }, [])

  const handleAddVariant = useCallback(() => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))
  }, [])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!form.title.trim()) {
      showToast('Назва товару є обовʼязковою', 'error')
      return
    }
    if (!form.handle.trim()) {
      showToast('Handle є обовʼязковим', 'error')
      return
    }

    setSaving(true)
    const base = window.location.origin
    const isCreate = !productId
    const url = isCreate
      ? `${base}/api/products`
      : `${base}/api/products/${productId}`
    const method = isCreate ? 'POST' : 'PATCH'
    const body = buildPayload(form, isCreate)

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      const saved = await res.json()
      if (isCreate && saved.doc?.id) {
        // Redirect to edit page of the newly created product
        window.location.href = `/admin/collections/products/${saved.doc.id}`
        return
      }
      showToast('Збережено успішно', 'success')
    } catch (err) {
      console.error('Save error:', err)
      showToast('Помилка збереження', 'error')
    } finally {
      setSaving(false)
    }
  }, [form, productId, showToast])

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!productId) return
    if (!window.confirm('Видалити цей товар? Цю дію неможливо скасувати.')) return
    const base = window.location.origin
    try {
      const res = await fetch(`${base}/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      window.location.href = '/admin/collections/products'
    } catch (err) {
      console.error('Delete error:', err)
      showToast('Помилка видалення', 'error')
    }
  }, [productId, showToast])

  // Duplicate handler
  const handleDuplicate = useCallback(async () => {
    const base = window.location.origin
    const body = {
      ...buildPayload(form, true),
      title:  `${form.title} (копія)`,
      handle: `${form.handle}-copy-${Date.now()}`,
    }
    try {
      const res = await fetch(`${base}/api/products`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const saved = await res.json()
      if (saved.doc?.id) {
        window.location.href = `/admin/collections/products/${saved.doc.id}`
      }
    } catch (err) {
      console.error('Duplicate error:', err)
      showToast('Помилка дублювання', 'error')
    }
  }, [form, showToast])

  // Preview handler
  const handlePreview = useCallback(() => {
    const handle = form.handle || productId
    if (handle) {
      window.open(`/products/${handle}`, '_blank', 'noopener,noreferrer')
    }
  }, [form.handle, productId])

  const breadcrumbTitle = isEditMode
    ? form.title || 'Без назви'
    : 'Створити новий'

  // ───────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────

  return (
    <div
      style={{
        fontFamily:   '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color:        C.textPrimary,
        background:   C.bgPrimary,
        minHeight:    '100vh',
        padding:      '0 0 48px',
      }}
    >
      {/* Global animations stylesheet already injected via useEffect */}

      {/* Toast */}
      {toast && <ToastNotification toast={toast} onDismiss={dismissToast} />}

      {/* ── Header ── */}
      <div
        style={{
          position:     'sticky',
          top:          0,
          zIndex:       100,
          background:   C.bgCard,
          borderBottom: `1px solid ${C.border}`,
          padding:      '14px 24px',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          gap:          16,
          flexWrap:     'wrap',
          boxShadow:    '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Breadcrumbs */}
        <nav aria-label="Навігація" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <a
            href="/admin/collections/products"
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
            Товари
          </a>
          <span style={{ color: C.textMuted, fontSize: 14 }}>/</span>
          <span
            style={{ fontSize: 14, color: C.textPrimary, fontWeight: 600, maxWidth: 260 }}
            title={breadcrumbTitle}
          >
            {breadcrumbTitle.length > 32
              ? `${breadcrumbTitle.slice(0, 32)}…`
              : breadcrumbTitle}
          </span>
        </nav>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isEditMode && (
            <button
              type="button"
              onClick={handlePreview}
              aria-label="Перегляд товару на сайті"
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          6,
                padding:      '9px 18px',
                borderRadius: 10,
                border:       `1px solid ${C.border}`,
                background:   C.bgSecondary,
                color:        C.textSecondary,
                fontSize:     13,
                fontWeight:   600,
                cursor:       'pointer',
                transition:   'background 0.2s',
              }}
            >
              <IconEye size={15} color={C.textSecondary} />
              Перегляд
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-label="Зберегти товар"
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
            {saving ? 'Збереження…' : 'Зберегти'}
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
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Title hero input */}
            <div style={{ marginBottom: 24 }}>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="[Без назви]"
                aria-label="Заголовок товару"
                style={{
                  width:          '100%',
                  fontSize:       '2.2rem',
                  fontWeight:     700,
                  color:          C.textPrimary,
                  background:     'transparent',
                  border:         'none',
                  borderBottom:   `2px solid ${C.border}`,
                  outline:        'none',
                  padding:        '8px 0',
                  lineHeight:     1.2,
                  boxSizing:      'border-box',
                  transition:     'border-color 0.3s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderBottomColor = C.sea400 }}
                onBlur={(e)  => { e.currentTarget.style.borderBottomColor = C.border  }}
              />
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

                {/* Basic Info Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'basic'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('basic')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>Основна інформація</h2>

                  <FieldGroup label="Назва товару" required>
                    <StyledInput
                      value={form.title}
                      onChange={(v) => setField('title', v)}
                      placeholder="Шампунь для волосся"
                      required
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Підзаголовок"
                    helper="Назва бренду або короткий опис"
                  >
                    <StyledInput
                      value={form.subtitle}
                      onChange={(v) => setField('subtitle', v)}
                      placeholder="Loreal Paris, зволожуючий"
                    />
                  </FieldGroup>

                  <FieldGroup label="Опис">
                    <DescriptionEditor
                      value={form.description}
                      onChange={(v) => setField('description', v)}
                    />
                  </FieldGroup>
                </div>

                {/* Thumbnail Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'thumbnail'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('thumbnail')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>Мініатюра</h2>
                  <ThumbnailZone
                    thumbnail={form.thumbnail}
                    onClear={() => setField('thumbnail', null)}
                  />
                </div>

                {/* Images Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'images'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('images')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>Зображення</h2>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      type="button"
                      aria-label="Додати зображення"
                      style={{
                        width:          60,
                        height:         60,
                        borderRadius:   '50%',
                        border:         `2px dashed ${C.sea400}`,
                        background:     'transparent',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        cursor:         'pointer',
                        transition:     'background 0.2s, border-color 0.2s',
                        flexShrink:     0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${C.sea400}1a` }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                      <IconPlus size={22} color={C.sea500} />
                    </button>
                    <span style={{ fontSize: 13, color: C.textMuted }}>Додати зображення</span>
                  </div>
                </div>

                {/* Variants Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'variants'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('variants')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>Варіанти</h2>

                  {form.variants.map((variant, idx) => (
                    <VariantCard
                      key={variant.id ?? idx}
                      variant={variant}
                      index={idx}
                      onChange={handleVariantChange}
                      onRemove={handleVariantRemove}
                    />
                  ))}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      aria-label="Додати варіант"
                      style={{
                        width:          60,
                        height:         60,
                        borderRadius:   '50%',
                        border:         `2px dashed ${C.sea400}`,
                        background:     'transparent',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        cursor:         'pointer',
                        transition:     'background 0.2s',
                        flexShrink:     0,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = `${C.sea400}1a` }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                    >
                      <IconPlus size={22} color={C.sea500} />
                    </button>
                    <span style={{ fontSize: 13, color: C.textMuted }}>
                      {form.variants.length === 0
                        ? 'Додати перший варіант'
                        : 'Додати варіант'}
                    </span>
                  </div>
                </div>

              </div>{/* end left column */}

              {/* ── Right column ── */}
              <div>

                {/* Meta Info Card */}
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

                  <FieldGroup label="Handle" required>
                    <StyledInput
                      value={form.handle}
                      onChange={(v) => setField('handle', v.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="shampoo-loreal-250ml"
                      required
                    />
                  </FieldGroup>

                  <FieldGroup label="Статус">
                    <StyledSelect
                      value={form.status}
                      onChange={(v) => setField('status', v as FormState['status'])}
                    >
                      <option value="draft">Чернетка</option>
                      <option value="active">Опубліковано</option>
                      <option value="archived">Архів</option>
                    </StyledSelect>
                  </FieldGroup>

                  <FieldGroup label="Категорія">
                    <StyledSelect
                      value={form.categoryId}
                      onChange={(v) => setField('categoryId', v)}
                    >
                      <option value="">— Оберіть категорію —</option>
                      {categories.map((cat) => (
                        <option key={String(cat.id)} value={String(cat.id)}>
                          {cat.title ?? cat.name ?? String(cat.id)}
                        </option>
                      ))}
                    </StyledSelect>
                  </FieldGroup>

                  <FieldGroup label="Бренд">
                    <StyledSelect
                      value={form.brandId}
                      onChange={(v) => setField('brandId', v)}
                    >
                      <option value="">— Оберіть бренд —</option>
                      {brands.map((b) => (
                        <option key={String(b.id)} value={String(b.id)}>
                          {b.title ?? b.name ?? String(b.id)}
                        </option>
                      ))}
                    </StyledSelect>
                  </FieldGroup>
                </div>

                {/* Pricing Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'pricing'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('pricing')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>Ціни</h2>

                  <FieldGroup label="Базова ціна">
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position:  'absolute',
                          left:      14,
                          top:       '50%',
                          transform: 'translateY(-50%)',
                          color:     C.textMuted,
                          fontSize:  14,
                          fontWeight: 600,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                        aria-hidden="true"
                      >
                        ₴
                      </span>
                      <input
                        type="number"
                        value={form.basePrice}
                        onChange={(e) => setField('basePrice', e.target.value)}
                        placeholder="0"
                        min={0}
                        step={0.01}
                        aria-label="Базова ціна в гривнях"
                        style={{
                          ...inputStyle,
                          paddingLeft: 32,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.sea400
                          e.currentTarget.style.boxShadow  = `0 0 0 3px rgba(91,196,196,0.15)`
                          e.currentTarget.style.background = C.bgCard
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.border
                          e.currentTarget.style.boxShadow  = 'none'
                          e.currentTarget.style.background = C.bgSecondary
                        }}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Ціна зі знижкою">
                    <div style={{ position: 'relative' }}>
                      <span
                        style={{
                          position:  'absolute',
                          left:      14,
                          top:       '50%',
                          transform: 'translateY(-50%)',
                          color:     C.textMuted,
                          fontSize:  14,
                          fontWeight: 600,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        }}
                        aria-hidden="true"
                      >
                        ₴
                      </span>
                      <input
                        type="number"
                        value={form.salePrice}
                        onChange={(e) => setField('salePrice', e.target.value)}
                        placeholder="0"
                        min={0}
                        step={0.01}
                        aria-label="Ціна зі знижкою в гривнях"
                        style={{
                          ...inputStyle,
                          paddingLeft: 32,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.sea400
                          e.currentTarget.style.boxShadow  = `0 0 0 3px rgba(91,196,196,0.15)`
                          e.currentTarget.style.background = C.bgCard
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.border
                          e.currentTarget.style.boxShadow  = 'none'
                          e.currentTarget.style.background = C.bgSecondary
                        }}
                      />
                    </div>
                  </FieldGroup>

                  <div
                    style={{
                      background:   `${C.sea400}0f`,
                      border:       `1px solid ${C.sea400}40`,
                      borderRadius: 12,
                      padding:      '10px 14px',
                      fontSize:     12,
                      color:        C.sea600,
                      marginTop:    -4,
                    }}
                    role="note"
                  >
                    Залиште порожнім, якщо немає знижки
                  </div>
                </div>

                {/* SEO Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'seo'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('seo')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>SEO</h2>

                  <FieldGroup label="Meta Title">
                    <div>
                      <div
                        style={{
                          display:        'flex',
                          justifyContent: 'flex-end',
                          marginBottom:   4,
                        }}
                      >
                        <CharCounter current={form.metaTitle.length} max={60} />
                      </div>
                      <StyledInput
                        value={form.metaTitle}
                        onChange={(v) => setField('metaTitle', v)}
                        placeholder="Заголовок для пошукових систем"
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Meta Description">
                    <div>
                      <div
                        style={{
                          display:        'flex',
                          justifyContent: 'flex-end',
                          marginBottom:   4,
                        }}
                      >
                        <CharCounter current={form.metaDescription.length} max={160} />
                      </div>
                      <StyledTextarea
                        value={form.metaDescription}
                        onChange={(v) => setField('metaDescription', v)}
                        placeholder="Короткий опис для пошукових систем"
                        rows={3}
                      />
                    </div>
                  </FieldGroup>
                </div>

                {/* Quick Actions Card */}
                <div
                  style={{
                    ...cardStyle,
                    boxShadow: hoveredCard === 'actions'
                      ? '0 8px 30px rgba(91,196,196,0.08)'
                      : cardStyle.boxShadow,
                  }}
                  onMouseEnter={() => setHoveredCard('actions')}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <h2 style={cardTitleStyle}>Швидкі дії</h2>

                  {/* Duplicate button */}
                  <button
                    type="button"
                    onClick={handleDuplicate}
                    aria-label="Дублювати товар"
                    style={{
                      width:          '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      gap:            8,
                      padding:        '11px 0',
                      marginBottom:   10,
                      borderRadius:   10,
                      border:         `1px solid ${C.sea400}`,
                      background:     dupBtnHovered ? `${C.sea400}18` : C.bgCard,
                      color:          C.sea600,
                      fontSize:       13,
                      fontWeight:     600,
                      cursor:         'pointer',
                      transition:     'background 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={() => setDupBtnHovered(true)}
                    onMouseLeave={() => setDupBtnHovered(false)}
                  >
                    <IconCopy size={15} color={C.sea500} />
                    Дублювати
                  </button>

                  {/* Delete button — only in edit mode */}
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      aria-label="Видалити товар"
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
                      onMouseEnter={() => setDeleteBtnHovered(true)}
                      onMouseLeave={() => setDeleteBtnHovered(false)}
                    >
                      <IconTrash size={15} color="#dc2626" />
                      Видалити
                    </button>
                  )}
                </div>

              </div>{/* end right column */}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
