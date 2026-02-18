'use client'

/**
 * ProductsListView — custom Payload CMS v3 list view for the Products collection.
 *
 * Registered in payload.config.ts as:
 *   admin.components.views.list: '/components/payload/views/products/ProductsListView'
 *
 * Usage: replaces Payload's default /admin/collections/products list page.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProductsViewData, getProductsFilterOptions, deleteProduct, deleteProducts } from '@/app/actions/admin-views'
import type { ProductViewItem, ProductsViewData, ProductsViewParams, ProductsFilterOptions } from '@/app/actions/admin-views'
import { useCleanPayloadUrl } from '../useCleanPayloadUrl'
import { CsvImportModal } from './CsvImportModal'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bgPrimary: 'var(--color-base-50)',
  bgSecondary: 'var(--color-base-50)',
  bgCard: 'var(--color-base-0)',
  border: 'var(--color-base-200)',
  sea400: '#7dd3d3',
  sea500: '#5bc4c4',
  sea600: '#4a9e9e',
  textPrimary: 'var(--color-base-700)',
  textSecondary: 'var(--color-base-500)',
  textMuted: 'var(--color-base-400)',
} as const

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #f9a8d4, #fb7185)',
  'linear-gradient(135deg, #c4b5fd, #a855f7)',
  'linear-gradient(135deg, #67e8f9, #60a5fa)',
  'linear-gradient(135deg, #fcd34d, #fb923c)',
  'linear-gradient(135deg, #6ee7b7, #2dd4bf)',
]

const UK_MONTHS = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру']

const STATUS_CHIPS = [
  { value: 'all', label: 'Всі товари' },
  { value: 'active', label: 'Опубліковані' },
  { value: 'draft', label: 'Чернетки' },
  { value: 'archived', label: 'Архів' },
] as const

const SORT_OPTIONS = [
  { value: '-updatedAt', label: 'Новіші' },
  { value: 'title', label: 'Назва: А-Я' },
  { value: '-variants.price', label: 'Ціна: від низької' },
] as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUkDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatPrice(value: number): string {
  return `₴${value.toLocaleString('uk-UA')}`
}

function getMinPrice(variants: ProductViewItem['variants']): number | null {
  if (!variants.length) return null
  return Math.min(...variants.map((v) => v.price))
}

function getComparePrice(variants: ProductViewItem['variants']): number | null {
  const compare = variants.map((v) => v.compareAtPrice).filter((v): v is number => v != null)
  return compare.length ? Math.max(...compare) : null
}

function getTotalInventory(variants: ProductViewItem['variants']): number {
  return variants.reduce((acc, v) => acc + (v.inventory ?? 0), 0)
}

// ─── SVG Icons (inline, no external deps) ────────────────────────────────────

function IconSearch({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconEdit({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function IconChevronLeft({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconChevronRight({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function IconPlus({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconFilter({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function IconGrid({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function IconList({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ width, height, radius = 6 }: { width: string | number; height: string | number; radius?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, #eef0f2 25%, #e4e7ea 50%, #eef0f2 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite linear',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string
  value: number
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  badge?: React.ReactNode
  note?: string
}

function StatsCard({ label, value, iconBg, iconColor: _iconColor, icon, badge, note }: StatsCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${hovered ? 'rgba(91,196,196,0.3)' : COLORS.border}`,
        borderRadius: 16,
        padding: '20px',
        boxShadow: hovered
          ? '0 8px 30px rgba(91,196,196,0.08)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{label}</span>
          <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>
            {value.toLocaleString('uk-UA')}
          </span>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
      {(badge || note) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {badge}
          {note && <span style={{ fontSize: 12, color: COLORS.textMuted }}>{note}</span>}
        </div>
      )}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  let bg: string
  let color: string
  let label: string
  let dotColor: string

  switch (status) {
    case 'active':
      bg = 'rgba(134,199,166,0.15)'
      color = '#5a9e7a'
      dotColor = '#86c7a6'
      label = 'Опубліковано'
      break
    case 'draft':
      bg = 'rgba(230,184,156,0.15)'
      color = '#b88a6e'
      dotColor = '#e6b89c'
      label = 'Чернетка'
      break
    case 'archived':
      bg = 'var(--color-base-50)'
      color = 'var(--color-base-400)'
      dotColor = 'var(--color-base-400)'
      label = 'Архів'
      break
    default:
      bg = 'var(--color-base-50)'
      color = 'var(--color-base-400)'
      dotColor = 'var(--color-base-400)'
      label = status
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 20,
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      {label}
    </span>
  )
}

// ─── Product Avatar ───────────────────────────────────────────────────────────

function ProductAvatar({ title, index, thumbnail }: { title: string; index: number; thumbnail: { url: string; alt: string } | null }) {
  const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
  const letter = (title || '?')[0].toUpperCase()

  if (thumbnail?.url) {
    return (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
          border: `1px solid ${COLORS.border}`,
        }}
      >
        <img
          src={thumbnail.url}
          alt={thumbnail.alt || title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#fff',
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: '-0.02em',
      }}
      aria-hidden="true"
    >
      {letter}
    </div>
  )
}

// ─── Table Row ────────────────────────────────────────────────────────────────

interface ProductRowProps {
  product: ProductViewItem
  index: number
  selected: boolean
  onToggleSelect: (id: string | number) => void
  onEdit: (id: string | number) => void
  onDelete: (id: string | number, title: string) => void
}

function ProductRow({ product, index, selected, onToggleSelect, onEdit, onDelete }: ProductRowProps) {
  const [hovered, setHovered] = useState(false)
  const [editHovered, setEditHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)

  const minPrice = getMinPrice(product.variants)
  const comparePrice = getComparePrice(product.variants)
  const totalInventory = getTotalInventory(product.variants)

  let stockColor: string = COLORS.textMuted
  let stockLabel = '0'
  if (totalInventory > 20) {
    stockColor = '#5a9e7a'
    stockLabel = String(totalInventory)
  } else if (totalInventory > 0) {
    stockColor = '#b88a6e'
    stockLabel = String(totalInventory)
  } else {
    stockColor = COLORS.textMuted
    stockLabel = '0'
  }

  const categoryLabel = product.categories.length > 0
    ? product.categories.map((c) => c.name).join(', ')
    : '—'

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: selected ? 'rgba(91,196,196,0.06)' : hovered ? 'rgba(91,196,196,0.03)' : 'transparent',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
    >
      {/* Checkbox */}
      <td style={{ padding: '14px 8px 14px 16px', verticalAlign: 'middle', width: 36 }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(product.id)}
          onClick={(e) => e.stopPropagation()}
          style={{ accentColor: COLORS.sea500, width: 16, height: 16, cursor: 'pointer' }}
          aria-label={`Вибрати ${product.title}`}
        />
      </td>

      {/* Product cell */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ProductAvatar title={product.title} index={index} thumbnail={product.thumbnail} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 220,
              }}
              title={product.title}
            >
              {product.title || '(без назви)'}
            </div>
            <div
              style={{
                fontSize: 12,
                color: COLORS.textMuted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 220,
                marginTop: 2,
              }}
              title={[product.brand?.name, product.subtitle].filter(Boolean).join(' • ')}
            >
              {[product.brand?.name, product.subtitle].filter(Boolean).join(' • ') || product.handle || '—'}
            </div>
          </div>
        </div>
      </td>

      {/* Category */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span
          style={{
            fontSize: 13,
            color: COLORS.textSecondary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            maxWidth: 160,
          }}
          title={categoryLabel}
        >
          {categoryLabel}
        </span>
      </td>

      {/* Price */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        {minPrice != null ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
              {formatPrice(minPrice)}
            </span>
            {comparePrice != null && comparePrice > minPrice && (
              <span style={{ fontSize: 12, color: COLORS.textMuted, textDecoration: 'line-through' }}>
                {formatPrice(comparePrice)}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 13, color: COLORS.textMuted }}>—</span>
        )}
      </td>

      {/* Stock */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: stockColor }}>{stockLabel}</span>
      </td>

      {/* Status */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <StatusBadge status={product.status} />
      </td>

      {/* Date */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <span style={{ fontSize: 12, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>
          {formatUkDate(product.updatedAt)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onEdit(product.id)}
            onMouseEnter={() => setEditHovered(true)}
            onMouseLeave={() => setEditHovered(false)}
            aria-label={`Редагувати ${product.title}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${editHovered ? COLORS.sea400 : COLORS.border}`,
              background: editHovered ? 'rgba(91,196,196,0.08)' : 'transparent',
              color: editHovered ? COLORS.sea600 : COLORS.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          >
            <IconEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(product.id, product.title)}
            onMouseEnter={() => setDeleteHovered(true)}
            onMouseLeave={() => setDeleteHovered(false)}
            aria-label={`Видалити ${product.title}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: `1px solid ${deleteHovered ? '#fca5a5' : COLORS.border}`,
              background: deleteHovered ? 'rgba(239,68,68,0.06)' : 'transparent',
              color: deleteHovered ? '#ef4444' : COLORS.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          >
            <IconTrash size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Table Skeleton ───────────────────────────────────────────────────────────

function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          <td style={{ padding: '14px 8px 14px 16px', width: 36 }}>
            <SkeletonBlock width={16} height={16} radius={3} />
          </td>
          <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <SkeletonBlock width={48} height={48} radius={12} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SkeletonBlock width={140} height={14} />
                <SkeletonBlock width={100} height={11} />
              </div>
            </div>
          </td>
          <td style={{ padding: '14px 16px' }}><SkeletonBlock width={100} height={13} /></td>
          <td style={{ padding: '14px 16px' }}><SkeletonBlock width={60} height={14} /></td>
          <td style={{ padding: '14px 16px' }}><SkeletonBlock width={30} height={13} /></td>
          <td style={{ padding: '14px 16px' }}><SkeletonBlock width={90} height={24} radius={20} /></td>
          <td style={{ padding: '14px 16px' }}><SkeletonBlock width={70} height={12} /></td>
          <td style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <SkeletonBlock width={32} height={32} radius={8} />
              <SkeletonBlock width={32} height={32} radius={8} />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalDocs: number
  limit: number
  onPageChange: (page: number) => void
}

function Pagination({ currentPage, totalPages, totalDocs, limit, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, totalDocs)

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter((p) => {
    if (totalPages <= 7) return true
    if (p === 1 || p === totalPages) return true
    if (Math.abs(p - currentPage) <= 2) return true
    return false
  })

  const withEllipsis: (number | '...')[] = []
  for (let i = 0; i < visiblePages.length; i++) {
    if (i > 0 && visiblePages[i] - (visiblePages[i - 1] as number) > 1) {
      withEllipsis.push('...')
    }
    withEllipsis.push(visiblePages[i])
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: `1px solid ${COLORS.border}`,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 13, color: COLORS.textMuted }}>
        Показано <strong style={{ color: COLORS.textSecondary }}>{totalDocs === 0 ? 0 : startItem}–{endItem}</strong> з{' '}
        <strong style={{ color: COLORS.textSecondary }}>{totalDocs}</strong>
      </span>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <PageButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Попередня сторінка"
          >
            <IconChevronLeft size={14} />
          </PageButton>

          {withEllipsis.map((item, i) =>
            item === '...' ? (
              <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: COLORS.textMuted, fontSize: 13 }}>
                …
              </span>
            ) : (
              <PageButton
                key={item}
                onClick={() => onPageChange(item as number)}
                active={item === currentPage}
              >
                {item}
              </PageButton>
            )
          )}

          <PageButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Наступна сторінка"
          >
            <IconChevronRight size={14} />
          </PageButton>
        </div>
      )}
    </div>
  )
}

interface PageButtonProps {
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  'aria-label'?: string
}

function PageButton({ onClick, children, active, disabled, 'aria-label': ariaLabel }: PageButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 32,
        height: 32,
        padding: '0 8px',
        borderRadius: 8,
        border: active ? 'none' : `1px solid ${hovered && !disabled ? COLORS.sea400 : COLORS.border}`,
        background: active
          ? `linear-gradient(135deg, ${COLORS.sea500}, ${COLORS.sea600})`
          : hovered && !disabled
          ? 'rgba(91,196,196,0.08)'
          : 'transparent',
        color: active ? '#fff' : disabled ? COLORS.textMuted : COLORS.textSecondary,
        fontWeight: active ? 600 : 400,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: active ? '0 2px 8px rgba(91,196,196,0.35)' : 'none',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '7px 16px',
        borderRadius: 20,
        border: active ? 'none' : `1px solid ${hovered ? COLORS.sea400 : COLORS.border}`,
        background: active
          ? COLORS.sea500
          : hovered
          ? 'rgba(91,196,196,0.06)'
          : COLORS.bgCard,
        color: active ? '#fff' : hovered ? COLORS.sea600 : COLORS.textSecondary,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        boxShadow: active ? '0 2px 8px rgba(91,196,196,0.3)' : 'none',
      }}
    >
      {label}
    </button>
  )
}

// ─── Product Grid Card ───────────────────────────────────────────────────────

interface ProductGridCardProps {
  product: ProductViewItem
  index: number
  selected: boolean
  onToggleSelect: (id: string | number) => void
  onEdit: (id: string | number) => void
  onDelete: (id: string | number, title: string) => void
}

function ProductGridCard({ product, index, selected, onToggleSelect, onEdit, onDelete }: ProductGridCardProps) {
  const [hovered, setHovered] = useState(false)
  const minPrice = getMinPrice(product.variants)
  const comparePrice = getComparePrice(product.variants)
  const totalInventory = getTotalInventory(product.variants)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${selected ? COLORS.sea500 : hovered ? 'rgba(91,196,196,0.3)' : COLORS.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: selected
          ? '0 0 0 2px rgba(91,196,196,0.25)'
          : hovered ? '0 8px 30px rgba(91,196,196,0.08)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          background: COLORS.bgSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {product.thumbnail?.url ? (
          <img
            src={product.thumbnail.url}
            alt={product.thumbnail.alt || product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 36,
            }}
          >
            {(product.title || '?')[0].toUpperCase()}
          </div>
        )}
        {/* Checkbox overlay */}
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 2 }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(product.id)}
            onClick={(e) => e.stopPropagation()}
            style={{
              accentColor: COLORS.sea500,
              width: 18,
              height: 18,
              cursor: 'pointer',
              opacity: selected || hovered ? 1 : 0,
              transition: 'opacity 0.15s ease',
            }}
            aria-label={`Вибрати ${product.title}`}
          />
        </div>
        {/* Status badge overlay */}
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <StatusBadge status={product.status} />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.textPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={product.title}
        >
          {product.title || '(без назви)'}
        </div>

        <div style={{ fontSize: 12, color: COLORS.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {[product.brand?.name, product.categories[0]?.name].filter(Boolean).join(' • ') || '—'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {minPrice != null ? (
              <>
                <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.textPrimary }}>{formatPrice(minPrice)}</span>
                {comparePrice != null && comparePrice > minPrice && (
                  <span style={{ fontSize: 11, color: COLORS.textMuted, textDecoration: 'line-through' }}>{formatPrice(comparePrice)}</span>
                )}
              </>
            ) : (
              <span style={{ fontSize: 13, color: COLORS.textMuted }}>—</span>
            )}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: totalInventory > 0 ? '#5a9e7a' : COLORS.textMuted }}>
            {totalInventory > 0 ? `${totalInventory} шт` : 'Немає'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <button
          onClick={() => onEdit(product.id)}
          aria-label={`Редагувати ${product.title}`}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            background: 'transparent',
            color: COLORS.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(91,196,196,0.06)'; e.currentTarget.style.color = COLORS.sea600 }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textMuted }}
        >
          <IconEdit size={13} /> Редагувати
        </button>
        <div style={{ width: 1, background: COLORS.border }} />
        <button
          onClick={() => onDelete(product.id, product.title)}
          aria-label={`Видалити ${product.title}`}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            background: 'transparent',
            color: COLORS.textMuted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; e.currentTarget.style.color = '#ef4444' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.textMuted }}
        >
          <IconTrash size={13} /> Видалити
        </button>
      </div>
    </div>
  )
}

// ─── Grid Skeleton ───────────────────────────────────────────────────────────

function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <SkeletonBlock width="100%" height={200} radius={0} />
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock width="80%" height={14} />
            <SkeletonBlock width="50%" height={11} />
            <SkeletonBlock width="40%" height={15} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const LIMIT = 10

export default function ProductsListView() {
  const router = useRouter()
  useCleanPayloadUrl()

  const [data, setData] = useState<ProductsViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<ProductsViewParams['status']>('all')
  const [sort, setSort] = useState<ProductsViewParams['sort']>('-updatedAt')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBrand, setFilterBrand] = useState('')
  const [filterOptions, setFilterOptions] = useState<ProductsFilterOptions | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Debounce search input
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  // Load filter options once when panel opens
  useEffect(() => {
    if (filtersOpen && !filterOptions) {
      getProductsFilterOptions().then(setFilterOptions).catch(console.error)
    }
  }, [filtersOpen, filterOptions])

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getProductsViewData({
        page,
        limit: LIMIT,
        search: debouncedSearch,
        status,
        sort,
        category: filterCategory || undefined,
        brand: filterBrand || undefined,
      })
      setData(result)
      setSelectedIds(new Set())
    } catch (err) {
      console.error('[ProductsListView] fetch error', err)
      setError('Помилка завантаження даних. Спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, status, sort, filterCategory, filterBrand])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle delete
  const handleDelete = useCallback(async (id: string | number, title: string) => {
    const confirmed = window.confirm(`Видалити товар "${title}"? Цю дію не можна скасувати.`)
    if (!confirmed) return
    try {
      await deleteProduct(id)
      await fetchData()
    } catch (err) {
      console.error('[ProductsListView] delete error', err)
      alert('Помилка видалення товару.')
    }
  }, [fetchData])

  // Handle bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return
    const confirmed = window.confirm(
      `Видалити ${selectedIds.size} ${selectedIds.size === 1 ? 'товар' : selectedIds.size < 5 ? 'товари' : 'товарів'}? Цю дію не можна скасувати.`
    )
    if (!confirmed) return
    setBulkDeleting(true)
    try {
      const result = await deleteProducts(Array.from(selectedIds))
      if (result.errors > 0) {
        alert(`Видалено: ${result.deleted}, помилок: ${result.errors}`)
      }
      setSelectedIds(new Set())
      await fetchData()
    } catch (err) {
      console.error('[ProductsListView] bulk delete error', err)
      alert('Помилка масового видалення.')
    } finally {
      setBulkDeleting(false)
    }
  }, [selectedIds, fetchData])

  // Selection helpers
  const toggleSelect = useCallback((id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (!data) return
    const allIds = data.products.map((p) => p.id)
    const allSelected = allIds.every((id) => selectedIds.has(id))
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allIds))
    }
  }, [data, selectedIds])

  const isAllSelected = data ? data.products.length > 0 && data.products.every((p) => selectedIds.has(p.id)) : false
  const isSomeSelected = selectedIds.size > 0

  // Handle edit
  const handleEdit = useCallback((id: string | number) => {
    router.push(`/admin/collections/products/${id}`)
  }, [router])

  const stats = data?.stats ?? { total: 0, active: 0, draft: 0, archived: 0 }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100%',
          background: COLORS.bgPrimary,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
          color: COLORS.textPrimary,
          animation: 'fadeIn 0.4s ease-out',
        }}
      >

        {/* ── Page Header ── */}
        <header
          style={{
            background: COLORS.bgCard,
            borderBottom: `1px solid ${COLORS.border}`,
            position: 'sticky',
            top: 0,
            zIndex: 40,
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: COLORS.textPrimary, lineHeight: 1.2 }}>
              Товари
            </h1>
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: '4px 0 0' }}>
              Керуйте каталогом продукції
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgSecondary,
                color: COLORS.textSecondary,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#eceef0' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = COLORS.bgSecondary }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Імпорт CSV
            </button>
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 16px',
                borderRadius: 10,
                border: `1px solid ${filtersOpen ? COLORS.sea400 : COLORS.border}`,
                background: filtersOpen ? 'rgba(91,196,196,0.08)' : COLORS.bgSecondary,
                color: filtersOpen ? COLORS.sea600 : COLORS.textSecondary,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!filtersOpen) (e.currentTarget as HTMLButtonElement).style.background = '#eceef0' }}
              onMouseLeave={(e) => { if (!filtersOpen) (e.currentTarget as HTMLButtonElement).style.background = COLORS.bgSecondary }}
            >
              <IconFilter size={14} />
              Фільтри
              {(filterCategory || filterBrand) && (
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: COLORS.sea500, color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {(filterCategory ? 1 : 0) + (filterBrand ? 1 : 0)}
                </span>
              )}
            </button>

            <a
              href="/admin/collections/products/create"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 18px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${COLORS.sea500}, ${COLORS.sea600})`,
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(91,196,196,0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 6px 20px rgba(91,196,196,0.45)'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 12px rgba(91,196,196,0.35)'
              }}
            >
              <IconPlus size={15} />
              Новий товар
            </a>
          </div>
        </header>

        {/* ── Filters Panel ── */}
        {filtersOpen && (
          <div
            style={{
              background: COLORS.bgCard,
              borderBottom: `1px solid ${COLORS.border}`,
              padding: '16px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>Категорія:</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgSecondary,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 160,
                }}
              >
                <option value="">Всі категорії</option>
                {filterOptions?.categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 13, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>Бренд:</label>
              <select
                value={filterBrand}
                onChange={(e) => { setFilterBrand(e.target.value); setPage(1) }}
                style={{
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgSecondary,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 160,
                }}
              >
                <option value="">Всі бренди</option>
                {filterOptions?.brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {(filterCategory || filterBrand) && (
              <button
                onClick={() => { setFilterCategory(''); setFilterBrand(''); setPage(1) }}
                style={{
                  padding: '7px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'rgba(239,68,68,0.08)',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              >
                Скинути фільтри
              </button>
            )}
          </div>
        )}

        {/* ── Page Body ── */}
        <div style={{ padding: '24px 28px', maxWidth: 1400, margin: '0 auto' }}>

          {/* ── Stats Grid ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Total */}
            <StatsCard
              label="Всього товарів"
              value={loading ? 0 : stats.total}
              iconBg="rgba(91,196,196,0.12)"
              iconColor={COLORS.sea600}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.sea600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
              }
              badge={
                !loading && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: COLORS.sea600, background: 'rgba(91,196,196,0.1)', padding: '2px 8px', borderRadius: 10 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15" /></svg>
                    +12%
                  </span>
                )
              }
            />

            {/* Active */}
            <StatsCard
              label="Опубліковано"
              value={loading ? 0 : stats.active}
              iconBg="rgba(90,158,122,0.12)"
              iconColor="#5a9e7a"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5a9e7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
              note={!loading && stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% від загального` : undefined}
            />

            {/* Draft */}
            <StatsCard
              label="Чернетки"
              value={loading ? 0 : stats.draft}
              iconBg="rgba(230,184,156,0.15)"
              iconColor="#b88a6e"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b88a6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              }
            />

            {/* Archived */}
            <StatsCard
              label="Архів"
              value={loading ? 0 : stats.archived}
              iconBg="rgba(154,165,171,0.12)"
              iconColor="var(--color-base-400)"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-base-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
                </svg>
              }
            />
          </div>

          {/* ── Filter Chips ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            {STATUS_CHIPS.map((chip) => (
              <FilterChip
                key={chip.value}
                label={chip.label}
                active={status === chip.value}
                onClick={() => { setStatus(chip.value as ProductsViewParams['status']); setPage(1) }}
              />
            ))}
          </div>

          {/* ── Bulk Action Bar ── */}
          {isSomeSelected && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 16,
                padding: '12px 18px',
                borderRadius: 12,
                background: 'rgba(91,196,196,0.06)',
                border: `1px solid ${COLORS.sea400}`,
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={toggleSelectAll}
                style={{ accentColor: COLORS.sea500, width: 16, height: 16, cursor: 'pointer' }}
                aria-label="Вибрати всі на сторінці"
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>
                Вибрано: {selectedIds.size}
              </span>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  background: 'transparent',
                  color: COLORS.textSecondary,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Скасувати вибір
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: bulkDeleting ? '#fca5a5' : '#ef4444',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: bulkDeleting ? 'not-allowed' : 'pointer',
                  opacity: bulkDeleting ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <IconTrash size={13} color="#fff" />
                {bulkDeleting ? 'Видалення...' : `Видалити (${selectedIds.size})`}
              </button>
            </div>
          )}

          {/* ── Search + Controls Row ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            {/* Search */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 260px',
                minWidth: 200,
                maxWidth: 400,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: COLORS.textMuted,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconSearch size={15} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Пошук товарів..."
                aria-label="Пошук товарів"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 38px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgSecondary,
                  fontSize: 13,
                  color: COLORS.textPrimary,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = COLORS.sea400
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,196,196,0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = COLORS.border
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.textMuted, whiteSpace: 'nowrap' }}>Сортування:</span>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as ProductsViewParams['sort']); setPage(1) }}
                aria-label="Сортування товарів"
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgCard,
                  fontSize: 13,
                  color: COLORS.textSecondary,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <button
                aria-label="Таблиця"
                onClick={() => setViewMode('list')}
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: viewMode === 'list' ? COLORS.sea500 : COLORS.bgCard,
                  color: viewMode === 'list' ? '#fff' : COLORS.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconList size={15} color={viewMode === 'list' ? '#fff' : undefined} />
              </button>
              <button
                aria-label="Сітка"
                onClick={() => setViewMode('grid')}
                style={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: viewMode === 'grid' ? COLORS.sea500 : COLORS.bgCard,
                  color: viewMode === 'grid' ? '#fff' : COLORS.textMuted,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconGrid size={15} color={viewMode === 'grid' ? '#fff' : undefined} />
              </button>
            </div>
          </div>

          {/* ── Error State ── */}
          {error && (
            <div
              role="alert"
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#dc2626',
                fontSize: 14,
                marginBottom: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span>{error}</span>
              <button
                onClick={fetchData}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(239,68,68,0.3)',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Спробувати ще раз
              </button>
            </div>
          )}

          {/* ── Empty State ── */}
          {!loading && (!data || data.products.length === 0) && (
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: '60px 20px',
                textAlign: 'center',
                color: COLORS.textMuted,
                fontSize: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span>
                  {debouncedSearch || status !== 'all'
                    ? 'Нічого не знайдено. Спробуйте змінити фільтри.'
                    : 'Товарів ще немає.'}
                </span>
                {!debouncedSearch && status === 'all' && (
                  <a href="/admin/collections/products/create" style={{ fontSize: 13, color: COLORS.sea600, textDecoration: 'none', fontWeight: 500 }}>
                    Створити перший товар
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── Products Grid View ── */}
          {viewMode === 'grid' && (loading || (data && data.products.length > 0)) && (
            <div>
              {loading ? (
                <GridSkeleton count={LIMIT} />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {data!.products.map((product, i) => (
                    <ProductGridCard
                      key={product.id}
                      product={product}
                      index={i}
                      selected={selectedIds.has(product.id)}
                      onToggleSelect={toggleSelect}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && data && data.totalPages >= 1 && (
                <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, marginTop: 16 }}>
                  <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    totalDocs={data.totalDocs}
                    limit={LIMIT}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Products Table View ── */}
          {viewMode === 'list' && (loading || (data && data.products.length > 0)) && (
            <div
              style={{
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: 700,
                  }}
                  aria-label="Таблиця товарів"
                >
                  <thead>
                    <tr
                      style={{
                        background: COLORS.bgSecondary,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <th
                        scope="col"
                        style={{
                          padding: '12px 8px 12px 16px',
                          width: 36,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          style={{ accentColor: COLORS.sea500, width: 16, height: 16, cursor: 'pointer' }}
                          aria-label="Вибрати всі на сторінці"
                        />
                      </th>
                      {['Товар', 'Категорія', 'Ціна', 'Запас', 'Статус', 'Оновлено', 'Дії'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            color: COLORS.textMuted,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <TableSkeleton rows={LIMIT} />
                    ) : (
                      data!.products.map((product, i) => (
                        <React.Fragment key={product.id}>
                          <ProductRow
                            product={product}
                            index={i}
                            selected={selectedIds.has(product.id)}
                            onToggleSelect={toggleSelect}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                          {i < data!.products.length - 1 && (
                            <tr aria-hidden="true">
                              <td colSpan={8} style={{ padding: 0 }}>
                                <div style={{ height: 1, background: COLORS.border, opacity: 0.6 }} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && data && data.totalPages >= 1 && (
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalDocs={data.totalDocs}
                  limit={LIMIT}
                  onPageChange={(p) => setPage(p)}
                />
              )}
            </div>
          )}

        </div>
      </div>

      <CsvImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => fetchData()}
      />
    </>
  )
}
