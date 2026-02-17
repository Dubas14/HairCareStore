'use client'

/**
 * BannersListView — custom Payload CMS v3 list view for the Banners collection.
 *
 * Registered in payload.config.ts as:
 *   admin.components.views.list: '/components/payload/views/banners/BannersListView'
 *
 * Usage: replaces Payload's default /admin/collections/banners list page.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getBannersViewData,
  toggleBannerActive,
  deleteBanner,
} from '@/app/actions/admin-views'
import type { BannerViewItem, BannersViewData } from '@/app/actions/admin-views'
import { useCleanPayloadUrl } from '../useCleanPayloadUrl'

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

const UK_MONTHS = [
  'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
  'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
]

type PositionFilter = 'all' | 'home' | 'category' | 'promo'
type StatusFilter = 'all' | 'active' | 'inactive'

const POSITION_TABS: { value: PositionFilter; label: string }[] = [
  { value: 'all', label: 'Всі' },
  { value: 'home', label: 'Головна' },
  { value: 'category', label: 'Категорії' },
  { value: 'promo', label: 'Акції' },
]

const POSITION_LABELS: Record<string, string> = {
  home: 'Головна',
  category: 'Категорія',
  promo: 'Акція',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUkDate(dateStr: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function getBannerGradient(position: string): string {
  switch (position) {
    case 'home':
      return 'linear-gradient(135deg, #5bc4c4, #4a9e9e)'
    case 'category':
      return 'linear-gradient(135deg, #818cf8, #6366f1)'
    case 'promo':
      return 'linear-gradient(135deg, #f472b6, #e11d48)'
    default:
      return 'var(--color-base-50)'
  }
}

// ─── SVG Icons (inline, no external deps) ────────────────────────────────────

function IconLayers({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function IconCheckCircle({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconClock({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function IconEye({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

function IconEdit({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function IconGrip({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="5" r="1" fill={color} stroke="none" />
      <circle cx="15" cy="5" r="1" fill={color} stroke="none" />
      <circle cx="9" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="15" cy="12" r="1" fill={color} stroke="none" />
      <circle cx="9" cy="19" r="1" fill={color} stroke="none" />
      <circle cx="15" cy="19" r="1" fill={color} stroke="none" />
    </svg>
  )
}

function IconSort({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  )
}

function IconMonitor({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ isActive, onChange }: { isActive: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange() }}
      aria-pressed={isActive}
      aria-label={isActive ? 'Деактивувати банер' : 'Активувати банер'}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        padding: 3,
        background: isActive ? 'linear-gradient(135deg, #5bc4c4, #4a9e9e)' : '#d1d8db',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          transform: isActive ? 'translateX(22px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
        }}
      />
    </button>
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

function CardSkeleton() {
  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      <div style={{ height: 200, background: '#f0f2f4' }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SkeletonBlock width="70%" height={16} />
        <SkeletonBlock width="50%" height={13} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <SkeletonBlock width={8} height={8} radius={4} />
          <SkeletonBlock width={60} height={13} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <SkeletonBlock width={80} height={32} radius={8} />
          <SkeletonBlock width={80} height={32} radius={8} />
        </div>
      </div>
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────────────────────────

interface StatsCardProps {
  label: string
  value: number | string
  subtitle: string
  iconBg: string
  icon: React.ReactNode
}

function StatsCard({ label, value, subtitle, iconBg, icon }: StatsCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${hovered ? 'rgba(91,196,196,0.3)' : COLORS.border}`,
        borderRadius: 16,
        padding: 20,
        boxShadow: hovered
          ? '0 8px 30px rgba(91,196,196,0.08)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{label}</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1 }}>
          {typeof value === 'number' ? value.toLocaleString('uk-UA') : value}
        </span>
        <span style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{subtitle}</span>
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
  )
}

// ─── Banner Card ──────────────────────────────────────────────────────────────

interface BannerCardProps {
  banner: BannerViewItem
  onToggle: (id: string | number, currentState: boolean) => void
  onEdit: (id: string | number) => void
  onDelete: (id: string | number, title: string) => void
  toggling: boolean
}

function BannerCard({ banner, onToggle, onEdit, onDelete, toggling }: BannerCardProps) {
  const [hovered, setHovered] = useState(false)
  const [editHovered, setEditHovered] = useState(false)
  const [deleteHovered, setDeleteHovered] = useState(false)

  const gradient = getBannerGradient(banner.position)
  const hasImage = Boolean(banner.image?.url)
  const positionLabel = POSITION_LABELS[banner.position] ?? banner.position

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 50px rgba(0,0,0,0.08)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Preview area */}
      <div
        style={{
          height: 200,
          position: 'relative',
          background: hasImage ? 'var(--color-base-200)' : banner.isActive ? gradient : 'var(--color-base-50)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Actual image background */}
        {hasImage && banner.image?.url && (
          <img
            src={banner.image.url}
            alt={banner.image.alt || banner.title}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Overlay for no-image state */}
        {!hasImage && !banner.isActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: 12, color: COLORS.textMuted }}>Немає превʼю</span>
          </div>
        )}

        {/* Centered overlay content (when image present or active gradient) */}
        {(hasImage || banner.isActive) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: hasImage
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)'
                : 'rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 16,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.4)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <span
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center',
                textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                maxWidth: 160,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={banner.title}
            >
              {banner.title}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, textAlign: 'center' }}>
              {positionLabel}
            </span>
          </div>
        )}

        {/* Position badge — top-left */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            padding: '4px 12px',
            borderRadius: 100,
            fontSize: 11,
            fontWeight: 600,
            background: banner.isActive
              ? 'linear-gradient(135deg, #5bc4c4, #4a9e9e)'
              : 'rgba(45,55,64,0.55)',
            color: '#fff',
            backdropFilter: 'blur(4px)',
            letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}
          aria-label={`Позиція ${banner.order}`}
        >
          #{banner.order} {positionLabel}
        </div>

        {/* Drag handle — top-right */}
        <button
          aria-label="Перетягнути для сортування"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            padding: 0,
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)' }}
        >
          <IconGrip size={14} color="rgba(255,255,255,0.85)" />
        </button>

        {/* Toggle switch — bottom-right */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            opacity: toggling ? 0.6 : 1,
            pointerEvents: toggling ? 'none' : 'auto',
          }}
        >
          <ToggleSwitch
            isActive={banner.isActive}
            onChange={() => onToggle(banner.id, banner.isActive)}
          />
        </div>
      </div>

      {/* Info section */}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Title */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: COLORS.textPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={banner.title}
        >
          {banner.title || '(без назви)'}
        </div>

        {/* Link */}
        {banner.link && (
          <div
            style={{
              fontSize: 13,
              color: COLORS.textMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={banner.link}
          >
            {banner.link}
          </div>
        )}

        {/* Status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: banner.isActive ? '#86c7a6' : COLORS.textMuted,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 13,
              color: banner.isActive ? '#5a9e7a' : COLORS.textMuted,
              fontWeight: 500,
            }}
          >
            {banner.isActive ? 'Активний' : 'Неактивний'}
          </span>
        </div>

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: COLORS.textMuted,
          }}
        >
          <span>{positionLabel}</span>
          <span aria-hidden="true">•</span>
          <span>{formatUkDate(banner.updatedAt)}</span>
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <button
            onClick={() => onEdit(banner.id)}
            onMouseEnter={() => setEditHovered(true)}
            onMouseLeave={() => setEditHovered(false)}
            aria-label={`Редагувати "${banner.title}"`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: `1px solid ${editHovered ? COLORS.sea400 : COLORS.border}`,
              background: editHovered ? 'rgba(91,196,196,0.08)' : 'transparent',
              color: editHovered ? COLORS.sea600 : COLORS.textSecondary,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <IconEdit size={13} color="currentColor" />
            Редагувати
          </button>
          <button
            onClick={() => onDelete(banner.id, banner.title)}
            onMouseEnter={() => setDeleteHovered(true)}
            onMouseLeave={() => setDeleteHovered(false)}
            aria-label={`Видалити "${banner.title}"`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              border: `1px solid ${deleteHovered ? '#fca5a5' : COLORS.border}`,
              background: deleteHovered ? 'rgba(239,68,68,0.06)' : 'transparent',
              color: deleteHovered ? '#ef4444' : COLORS.textMuted,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <IconTrash size={13} color="currentColor" />
            Видалити
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Create Card (last grid item) ─────────────────────────────────────────────

function CreateCard({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Створити новий банер"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        minHeight: 350,
        border: `2px dashed ${hovered ? COLORS.sea400 : '#d1d8db'}`,
        borderRadius: 20,
        background: hovered ? 'rgba(91,196,196,0.03)' : 'transparent',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.25s ease',
        padding: 24,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: `2px dashed ${hovered ? COLORS.sea500 : '#d1d8db'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.25s ease',
        }}
      >
        <IconPlus size={20} color={hovered ? COLORS.sea500 : COLORS.textMuted} />
      </div>
      <span
        style={{
          fontSize: 14,
          color: hovered ? COLORS.sea600 : COLORS.textMuted,
          fontWeight: 500,
          transition: 'color 0.25s ease',
        }}
      >
        Створити банер
      </span>
    </a>
  )
}

// ─── Site Preview Section ─────────────────────────────────────────────────────

type DeviceType = 'desktop' | 'tablet' | 'mobile'

interface PreviewSectionProps {
  firstActiveBanner: BannerViewItem | null
}

function PreviewSection({ firstActiveBanner }: PreviewSectionProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [previewHovered, setPreviewHovered] = useState(false)

  const deviceTabs: { value: DeviceType; label: string }[] = [
    { value: 'desktop', label: 'Десктоп' },
    { value: 'tablet', label: 'Планшет' },
    { value: 'mobile', label: 'Мобільний' },
  ]

  const gradient = firstActiveBanner ? getBannerGradient(firstActiveBanner.position) : 'linear-gradient(135deg, #5bc4c4, #4a9e9e)'
  const previewTitle = firstActiveBanner?.title ?? 'Банер не вибрано'
  const hasImage = Boolean(firstActiveBanner?.image?.url)

  return (
    <div
      style={{
        background: COLORS.bgCard,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        marginTop: 32,
      }}
    >
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(91,196,196,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconMonitor size={18} color={COLORS.sea600} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.textPrimary }}>
              Превʼю на сайті
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              Перший активний банер
            </div>
          </div>
        </div>

        {/* Device tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: COLORS.bgSecondary,
            borderRadius: 10,
            padding: 4,
            gap: 2,
          }}
        >
          {deviceTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDevice(tab.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 7,
                border: 'none',
                background: device === tab.value ? COLORS.bgCard : 'transparent',
                color: device === tab.value ? COLORS.textPrimary : COLORS.textMuted,
                fontSize: 13,
                fontWeight: device === tab.value ? 600 : 400,
                cursor: 'pointer',
                boxShadow: device === tab.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Browser mockup container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          onMouseEnter={() => setPreviewHovered(true)}
          onMouseLeave={() => setPreviewHovered(false)}
          style={{
            width: device === 'desktop' ? '100%' : device === 'tablet' ? 600 : 320,
            maxWidth: '100%',
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            overflow: 'hidden',
            boxShadow: previewHovered
              ? '0 20px 50px rgba(0,0,0,0.1)'
              : '0 20px 50px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {/* Browser title bar */}
          <div
            style={{
              background: '#f0f2f4',
              borderBottom: `1px solid ${COLORS.border}`,
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
            </div>
            {/* URL bar */}
            <div
              style={{
                flex: 1,
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 12,
                color: COLORS.textMuted,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              hairlab.ua
            </div>
          </div>

          {/* Browser content — banner preview */}
          <div
            style={{
              position: 'relative',
              height: device === 'mobile' ? 200 : 280,
              background: hasImage ? 'var(--color-base-200)' : gradient,
              overflow: 'hidden',
            }}
          >
            {hasImage && firstActiveBanner?.image?.url && (
              <img
                src={firstActiveBanner.image.url}
                alt={firstActiveBanner.image.alt || previewTitle}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: hasImage
                  ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 100%)'
                  : 'transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: device === 'mobile' ? 16 : 20,
                  fontWeight: 700,
                  color: firstActiveBanner ? '#fff' : COLORS.textMuted,
                  textAlign: 'center',
                  textShadow: firstActiveBanner ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                  maxWidth: 400,
                }}
              >
                {previewTitle}
              </div>
              {firstActiveBanner?.link && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.75)',
                    textAlign: 'center',
                  }}
                >
                  {firstActiveBanner.link}
                </div>
              )}
            </div>

            {/* Navigation dots */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 6,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: i === 0 ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === 0 ? COLORS.sea500 : 'rgba(255,255,255,0.5)',
                    transition: 'width 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BannersListView() {
  const router = useRouter()
  useCleanPayloadUrl()

  const [data, setData] = useState<BannersViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Optimistic UI state for toggling
  const [localBanners, setLocalBanners] = useState<BannerViewItem[]>([])
  const [togglingIds, setTogglingIds] = useState<Set<string | number>>(new Set())

  // Client-side filters (no server round-trip needed — banners are a small set)
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  // Fetch all banner data
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getBannersViewData()
      setData(result)
      setLocalBanners(result.banners)
    } catch (err) {
      console.error('[BannersListView] fetch error', err)
      setError('Помилка завантаження даних. Спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle toggle with optimistic update
  const handleToggle = useCallback(async (id: string | number, currentIsActive: boolean) => {
    const newState = !currentIsActive

    // Optimistic update
    setLocalBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: newState } : b))
    )
    setTogglingIds((prev) => new Set(prev).add(id))

    try {
      await toggleBannerActive(id, newState)
      await fetchData()
    } catch (err) {
      console.error('[BannersListView] toggle error', err)
      // Rollback on failure
      setLocalBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: currentIsActive } : b))
      )
      alert('Помилка зміни статусу банера.')
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [fetchData])

  // Handle delete
  const handleDelete = useCallback(async (id: string | number, title: string) => {
    const confirmed = window.confirm(`Видалити банер "${title}"? Цю дію не можна скасувати.`)
    if (!confirmed) return
    try {
      // Optimistic removal
      setLocalBanners((prev) => prev.filter((b) => b.id !== id))
      await deleteBanner(id)
      await fetchData()
    } catch (err) {
      console.error('[BannersListView] delete error', err)
      await fetchData() // re-sync on failure
      alert('Помилка видалення банера.')
    }
  }, [fetchData])

  // Handle edit navigation
  const handleEdit = useCallback((id: string | number) => {
    router.push(`/admin/collections/banners/${id}`)
  }, [router])

  // Client-side filtering
  const filteredBanners = localBanners.filter((b) => {
    const matchPosition = positionFilter === 'all' || b.position === positionFilter
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && b.isActive) ||
      (statusFilter === 'inactive' && !b.isActive)
    return matchPosition && matchStatus
  })

  const stats = data?.stats ?? { total: 0, active: 0, inactive: 0, home: 0, category: 0, promo: 0 }
  const firstActiveBanner = localBanners.find((b) => b.isActive) ?? null

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
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
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: COLORS.textPrimary,
                lineHeight: 1.2,
              }}
            >
              Банери
            </h1>
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: '4px 0 0' }}>
              Керуйте головними банерами сайту
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Preview button */}
            <button
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
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#eceef0' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.bgSecondary }}
              onClick={() => {
                const el = document.getElementById('banners-preview-section')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <IconEye size={14} color="currentColor" />
              Превью
            </button>

            {/* New banner button */}
            <a
              href="/admin/collections/banners/create"
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
              <IconPlus size={15} color="#fff" />
              Новий банер
            </a>
          </div>
        </header>

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
              label="Всього банерів"
              value={loading ? 0 : stats.total}
              subtitle={loading ? '...' : `${stats.active} активних`}
              iconBg="rgba(91,196,196,0.12)"
              icon={<IconLayers size={18} color={COLORS.sea600} />}
            />
            {/* Active */}
            <StatsCard
              label="Активні"
              value={loading ? 0 : stats.active}
              subtitle="Показуються на сайті"
              iconBg="rgba(90,158,122,0.12)"
              icon={<IconCheckCircle size={18} color="#5a9e7a" />}
            />
            {/* Inactive / Scheduled */}
            <StatsCard
              label="Заплановані"
              value={loading ? 0 : stats.inactive}
              subtitle="Очікують активації"
              iconBg="rgba(245,158,11,0.1)"
              icon={<IconClock size={18} color="#d97706" />}
            />
            {/* Views today — static placeholder */}
            <StatsCard
              label="Показів сьогодні"
              value="—"
              subtitle="Статистика"
              iconBg="rgba(59,130,246,0.1)"
              icon={<IconEye size={18} color="#3b82f6" />}
            />
          </div>

          {/* ── Filter Controls ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}
          >
            {/* Position tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: COLORS.bgCard,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: 4,
                gap: 2,
              }}
            >
              {POSITION_TABS.map((tab) => {
                const active = positionFilter === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => setPositionFilter(tab.value)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 7,
                      border: 'none',
                      background: active
                        ? COLORS.sea500
                        : 'transparent',
                      color: active ? '#fff' : COLORS.textSecondary,
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              aria-label="Фільтр за статусом"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgCard,
                fontSize: 13,
                color: COLORS.textSecondary,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">Всі статуси</option>
              <option value="active">Активні</option>
              <option value="inactive">Неактивні</option>
            </select>

            {/* Sort button (visual only) */}
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '8px 14px',
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.bgCard,
                color: COLORS.textSecondary,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bgSecondary }}
              onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.bgCard }}
            >
              <IconSort size={14} color="currentColor" />
              Сортування за позицією
            </button>

            {/* Active filters summary */}
            {(positionFilter !== 'all' || statusFilter !== 'all') && (
              <span style={{ fontSize: 12, color: COLORS.textMuted }}>
                Знайдено: <strong style={{ color: COLORS.textPrimary }}>{filteredBanners.length}</strong>
              </span>
            )}
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
                marginBottom: 24,
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

          {/* ── Banners Grid ── */}
          {loading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}
              aria-busy="true"
              aria-label="Завантаження банерів..."
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filteredBanners.length === 0 && !loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '80px 24px',
                textAlign: 'center',
              }}
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.textMuted}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 4 }}>
                  Банерів не знайдено
                </div>
                <div style={{ fontSize: 14, color: COLORS.textMuted }}>
                  {positionFilter !== 'all' || statusFilter !== 'all'
                    ? 'Спробуйте змінити фільтри'
                    : 'Створіть перший банер'}
                </div>
              </div>
              {positionFilter === 'all' && statusFilter === 'all' && (
                <a
                  href="/admin/collections/banners/create"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '10px 20px',
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${COLORS.sea500}, ${COLORS.sea600})`,
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(91,196,196,0.35)',
                  }}
                >
                  <IconPlus size={15} color="#fff" />
                  Створити банер
                </a>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 24,
              }}
              aria-label="Список банерів"
            >
              {filteredBanners.map((banner) => (
                <BannerCard
                  key={banner.id}
                  banner={banner}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  toggling={togglingIds.has(banner.id)}
                />
              ))}

              {/* Create card — always last */}
              <CreateCard href="/admin/collections/banners/create" />
            </div>
          )}

          {/* ── Site Preview Section ── */}
          {!loading && (
            <div id="banners-preview-section">
              <PreviewSection firstActiveBanner={firstActiveBanner} />
            </div>
          )}

        </div>
      </div>
    </>
  )
}
