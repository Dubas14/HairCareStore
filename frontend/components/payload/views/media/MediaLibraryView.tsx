'use client'

/**
 * MediaLibraryView — custom Payload CMS v3 list view for the Media collection.
 *
 * Registered in payload.config.ts under the Media collection:
 *   admin.components.views.list: '/components/payload/views/media/MediaLibraryView'
 *
 * Usage (payload.config.ts Media collection admin block):
 *   admin: {
 *     components: {
 *       views: {
 *         list: '/components/payload/views/media/MediaLibraryView',
 *       },
 *     },
 *   },
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getMediaViewData, deleteMediaFile } from '@/app/actions/admin-views'
import type { MediaFileItem, MediaViewData, MediaViewStats } from '@/app/actions/admin-views'

// ─── Color palette ────────────────────────────────────────────────────────────

const C = {
  bgPrimary:     '#fafbfc',
  bgSecondary:   '#f5f7f8',
  bgCard:        '#ffffff',
  border:        '#e4e8ea',
  sea400:        '#7dd3d3',
  sea500:        '#5bc4c4',
  sea600:        '#4a9e9e',
  textPrimary:   '#2d3740',
  textSecondary: '#6b7880',
  textMuted:     '#9aa5ab',
  danger:        '#ef4444',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const UA_MONTHS = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру']

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${UA_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}
function isVideo(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}
function isPdf(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const IconCamera = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)

const IconPlay = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
    <circle cx="12" cy="12" r="12" fill="rgba(0,0,0,0.5)"/>
    <polygon points="10,8 16,12 10,16" fill="white"/>
  </svg>
)

const IconFile = ({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
)

const IconCloudUpload = ({ size = 48, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
)

const IconSearch = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const IconTrash = ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const IconCheck = ({ size = 12, color = '#ffffff' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconGrid = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const IconList = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
)

const IconFolder = ({ color = '#f59e0b' }: { color?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} stroke="none" aria-hidden="true">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
)

const IconChevronLeft = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const IconChevronRight = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// ─── Static folder data ────────────────────────────────────────────────────────

const FOLDERS = [
  { name: 'Товари',  count: 124, color: '#f59e0b', gradientFrom: '#fef3c7', gradientTo: '#fde68a' },
  { name: 'Банери',  count: 18,  color: '#ec4899', gradientFrom: '#fce7f3', gradientTo: '#fbcfe8' },
  { name: 'Бренди',  count: 45,  color: '#8b5cf6', gradientFrom: '#ede9fe', gradientTo: '#ddd6fe' },
  { name: 'Відгуки', count: 67,  color: '#10b981', gradientFrom: '#d1fae5', gradientTo: '#a7f3d0' },
]

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          aspectRatio: '1/1',
          background: `linear-gradient(90deg, ${C.bgSecondary} 25%, #edf0f2 50%, ${C.bgSecondary} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }}
      />
      <div style={{ padding: 12 }}>
        <div style={{ height: 13, borderRadius: 6, background: C.bgSecondary, marginBottom: 6, width: '75%' }} />
        <div style={{ height: 11, borderRadius: 6, background: C.bgSecondary, width: '50%' }} />
      </div>
    </div>
  )
}

// ─── Media card ───────────────────────────────────────────────────────────────

interface MediaCardProps {
  file: MediaFileItem
  selected: boolean
  viewMode: 'grid' | 'list'
  onToggleSelect: (id: string | number) => void
  onDelete: (id: string | number, filename: string) => void
}

function MediaCard({ file, selected, viewMode, onToggleSelect, onDelete }: MediaCardProps) {
  const [hovered, setHovered] = useState(false)
  const previewSrc = file.thumbnailURL || file.url

  const cardStyle: React.CSSProperties = viewMode === 'grid'
    ? {
        background: C.bgCard,
        border: `1px solid ${selected ? C.sea500 : hovered ? C.sea400 : C.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: selected
          ? `0 0 0 2px rgba(91,196,196,0.3), 0 4px 16px rgba(91,196,196,0.08)`
          : hovered
          ? '0 12px 40px rgba(91,196,196,0.1)'
          : '0 1px 4px rgba(45,55,64,0.04)',
      }
    : {
        background: C.bgCard,
        border: `1px solid ${selected ? C.sea500 : hovered ? C.sea400 : C.border}`,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        boxShadow: selected
          ? `0 0 0 2px rgba(91,196,196,0.3)`
          : hovered
          ? '0 4px 16px rgba(91,196,196,0.08)'
          : 'none',
      }

  const handleCardClick = (e: React.MouseEvent) => {
    // Navigate to edit page when not clicking checkbox or delete button
    const target = e.target as HTMLElement
    if (target.closest('[data-checkbox]') || target.closest('[data-delete]')) return
    window.location.href = `/admin/collections/media/${file.id}`
  }

  const renderPreview = (small = false) => {
    const size = small ? 48 : undefined

    if (isImage(file.mimeType) && previewSrc) {
      return (
        <img
          src={previewSrc}
          alt={file.alt || file.filename}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            ...(small ? { width: size, height: size, borderRadius: 8, flexShrink: 0 } : {}),
          }}
          loading="lazy"
        />
      )
    }

    if (isVideo(file.mimeType)) {
      return (
        <div
          style={{
            width: small ? size : '100%',
            height: small ? size : '100%',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(small ? { borderRadius: 8, flexShrink: 0 } : {}),
          }}
        >
          <IconPlay size={small ? 24 : 40} />
        </div>
      )
    }

    if (isPdf(file.mimeType)) {
      return (
        <div
          style={{
            width: small ? size : '100%',
            height: small ? size : '100%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(small ? { borderRadius: 8, flexShrink: 0 } : {}),
          }}
        >
          <IconFile size={small ? 22 : 36} color={C.danger} />
        </div>
      )
    }

    return (
      <div
        style={{
          width: small ? size : '100%',
          height: small ? size : '100%',
          background: `linear-gradient(135deg, ${C.bgSecondary}, #e8ecee)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(small ? { borderRadius: 8, flexShrink: 0 } : {}),
        }}
      >
        <IconCamera size={small ? 20 : 32} color={C.textMuted} />
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div
        style={cardStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e as any) }}
        aria-label={`Медіафайл ${file.filename}`}
      >
        {/* Checkbox */}
        <div
          data-checkbox
          onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id) }}
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `2px solid ${selected ? C.sea500 : C.border}`,
            background: selected ? C.sea500 : C.bgCard,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          aria-label={selected ? 'Зняти вибір' : 'Вибрати'}
        >
          {selected && <IconCheck size={10} />}
        </div>

        {/* Thumbnail */}
        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          {renderPreview(true)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: C.textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {file.filename}
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
            {file.mimeType}
          </div>
        </div>

        {/* Size */}
        <div style={{ fontSize: 12, color: C.textSecondary, flexShrink: 0, minWidth: 64, textAlign: 'right' }}>
          {formatFileSize(file.filesize)}
        </div>

        {/* Dimensions */}
        {(file.width > 0 && file.height > 0) && (
          <div style={{ fontSize: 12, color: C.textMuted, flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
            {file.width}&times;{file.height}
          </div>
        )}

        {/* Date */}
        <div style={{ fontSize: 12, color: C.textMuted, flexShrink: 0, minWidth: 90, textAlign: 'right' }}>
          {formatDate(file.createdAt)}
        </div>

        {/* Delete */}
        <button
          data-delete
          onClick={(e) => { e.stopPropagation(); onDelete(file.id, file.filename) }}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: hovered ? 'rgba(239,68,68,0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            opacity: hovered ? 1 : 0,
          }}
          aria-label="Видалити файл"
        >
          <IconTrash color={C.danger} />
        </button>
      </div>
    )
  }

  // Grid view
  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(e as any) }}
      aria-label={`Медіафайл ${file.filename}`}
    >
      {/* Preview area */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
        {renderPreview()}

        {/* Video badge */}
        {isVideo(file.mimeType) && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,0.7)',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
              letterSpacing: '0.03em',
            }}
          >
            VIDEO
          </div>
        )}

        {/* Checkbox overlay */}
        <div
          data-checkbox
          onClick={(e) => { e.stopPropagation(); onToggleSelect(file.id) }}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `2px solid ${selected ? C.sea500 : 'rgba(255,255,255,0.8)'}`,
            background: selected ? C.sea500 : 'rgba(255,255,255,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            opacity: hovered || selected ? 1 : 0,
          }}
          aria-label={selected ? 'Зняти вибір' : 'Вибрати'}
        >
          {selected && <IconCheck size={12} />}
        </div>

        {/* Delete overlay */}
        <button
          data-delete
          onClick={(e) => { e.stopPropagation(); onDelete(file.id, file.filename) }}
          style={{
            position: 'absolute',
            top: isVideo(file.mimeType) ? 'auto' : 8,
            bottom: isVideo(file.mimeType) ? 8 : 'auto',
            right: 8,
            width: 26,
            height: 26,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            opacity: hovered ? 1 : 0,
          }}
          aria-label="Видалити файл"
        >
          <IconTrash size={12} color="#ffffff" />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '10px 12px 12px' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.textPrimary,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.35,
          }}
          title={file.filename}
        >
          {file.filename}
        </div>
        <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3, display: 'flex', gap: 6 }}>
          <span>{formatFileSize(file.filesize)}</span>
          <span style={{ color: C.border }}>·</span>
          <span>{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MediaLibraryView() {
  // Data state
  const [data, setData] = useState<MediaViewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Controls
  const [search, setSearch] = useState('')
  const [mimeFilter, setMimeFilter] = useState('')
  const [sort, setSort] = useState('-createdAt')
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())

  // Dropzone
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Inject keyframes ──────────────────────────────────────────────────────

  useEffect(() => {
    const styleId = 'media-library-keyframes'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async (opts?: { resetPage?: boolean }) => {
    const targetPage = opts?.resetPage ? 1 : page
    if (opts?.resetPage) setPage(1)

    setLoading(true)
    setError(null)
    try {
      const result = await getMediaViewData({
        page: targetPage,
        limit: 24,
        search,
        mimeType: mimeFilter,
        sort,
      })
      setData(result)
    } catch (err) {
      setError('Помилка завантаження медіафайлів')
      console.error('[MediaLibraryView] fetchData error:', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, mimeFilter, sort])

  useEffect(() => {
    fetchData()
  }, [page, mimeFilter, sort])

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      fetchData({ resetPage: true })
    }, 300)
  }

  // ── File upload ────────────────────────────────────────────────────────────

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files)
    if (arr.length === 0) return

    setUploading(true)
    setUploadProgress(`Завантаження 0 / ${arr.length}...`)

    let done = 0
    for (const file of arr) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('alt', file.name.replace(/\.[^.]+$/, ''))

        const res = await fetch('/api/media', { method: 'POST', body: formData })
        if (!res.ok) {
          console.warn('[MediaLibraryView] Upload failed for', file.name, res.status)
        }
        done++
        setUploadProgress(`Завантаження ${done} / ${arr.length}...`)
      } catch (e) {
        console.error('[MediaLibraryView] Upload error:', e)
      }
    }

    setUploading(false)
    setUploadProgress(null)
    fetchData({ resetPage: true })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string | number, filename: string) => {
    if (!window.confirm(`Видалити "${filename}"? Цю дію не можна скасувати.`)) return
    try {
      await deleteMediaFile(id)
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
      fetchData()
    } catch (err) {
      console.error('[MediaLibraryView] Delete error:', err)
      alert('Помилка видалення файлу')
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Видалити ${selectedIds.size} файл(ів)? Цю дію не можна скасувати.`)) return

    for (const id of selectedIds) {
      try {
        await deleteMediaFile(id)
      } catch (err) {
        console.error('[MediaLibraryView] Delete error for id', id, err)
      }
    }
    setSelectedIds(new Set())
    fetchData()
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats: MediaViewStats = data?.stats ?? { totalFiles: 0, images: 0, videos: 0, others: 0 }
  const totalPages = data?.totalPages ?? 1
  const totalDocs = data?.totalDocs ?? 0
  const files = data?.files ?? []

  const usagePercent = stats.totalFiles > 0
    ? Math.min(100, Math.round((stats.images / Math.max(stats.totalFiles, 1)) * 100))
    : 0

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: C.bgPrimary,
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
        aria-label="Вибір файлів для завантаження"
      />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        style={{
          background: C.bgCard,
          borderBottom: `1px solid ${C.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 40,
          borderRadius: '0 0 16px 16px',
          margin: '0 16px',
          padding: '16px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0, lineHeight: 1.2 }}>
              Медіа бібліотека
            </h1>
            <p style={{ fontSize: 13, color: C.textSecondary, margin: '4px 0 0', lineHeight: 1 }}>
              Керуйте зображеннями та файлами
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                style={{
                  height: 38,
                  padding: '0 16px',
                  border: `1px solid ${C.danger}`,
                  borderRadius: 10,
                  background: 'rgba(239,68,68,0.06)',
                  color: C.danger,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 0.2s',
                }}
              >
                <IconTrash size={14} color={C.danger} />
                Видалити ({selectedIds.size})
              </button>
            )}

            <button
              onClick={() => {}}
              style={{
                height: 38,
                padding: '0 16px',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                background: C.bgSecondary,
                color: C.textSecondary,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              + Нова папка
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                height: 38,
                padding: '0 18px',
                border: 'none',
                borderRadius: 10,
                background: uploading
                  ? C.bgSecondary
                  : `linear-gradient(135deg, ${C.sea500}, ${C.sea600})`,
                color: uploading ? C.textMuted : '#ffffff',
                fontSize: 13,
                fontWeight: 700,
                cursor: uploading ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: uploading ? 'none' : `0 4px 14px rgba(91,196,196,0.35)`,
                letterSpacing: '0.02em',
              }}
              aria-busy={uploading}
            >
              {uploading ? (uploadProgress ?? 'Завантаження...') : '+ Завантажити'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '24px 24px 48px' }}>

        {/* ── Upload Dropzone ──────────────────────────────────────────── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? C.sea400 : '#d1d9dd'}`,
            borderRadius: 20,
            padding: '40px 24px',
            marginBottom: 24,
            background: dragOver
              ? 'linear-gradient(135deg, rgba(91,196,196,0.08), rgba(91,196,196,0.14))'
              : 'linear-gradient(135deg, rgba(91,196,196,0.03), rgba(91,196,196,0.08))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            userSelect: 'none',
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
          aria-label="Завантажити файли — натисніть або перетягніть"
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: C.bgCard,
              boxShadow: '0 4px 20px rgba(91,196,196,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.2s ease',
              transform: dragOver ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <IconCloudUpload size={36} color={dragOver ? C.sea500 : C.textSecondary} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: dragOver ? C.sea600 : C.textPrimary, margin: 0 }}>
              Перетягніть файли сюди
            </p>
            <p style={{ fontSize: 13, color: C.textMuted, margin: '4px 0 0' }}>
              або натисніть для вибору
            </p>
          </div>

          <p style={{ fontSize: 12, color: C.textMuted, margin: 0, letterSpacing: '0.02em' }}>
            JPG, PNG, MP4, MOV, PDF &bull; до 50MB
          </p>
        </div>

        {/* ── Storage Stats ──────────────────────────────────────────────── */}
        <div
          style={{
            background: C.bgCard,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: '16px 20px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: C.textSecondary }}>
                  <strong style={{ color: C.textPrimary }}>{stats.totalFiles}</strong> файлів
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.sea500, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: C.textSecondary }}>
                  <strong style={{ color: C.textPrimary }}>{stats.images}</strong> зображень
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: C.textSecondary }}>
                  <strong style={{ color: C.textPrimary }}>{stats.videos}</strong> відео
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: C.textMuted, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: C.textSecondary }}>
                  <strong style={{ color: C.textPrimary }}>{stats.others}</strong> інших
                </span>
              </div>
            </div>

            {selectedIds.size > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: C.sea600, background: 'rgba(91,196,196,0.1)', padding: '4px 12px', borderRadius: 20 }}>
                Обрано: {selectedIds.size}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 8,
              borderRadius: 8,
              background: C.bgSecondary,
              overflow: 'hidden',
            }}
            role="progressbar"
            aria-valuenow={usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Частка зображень у медіабібліотеці"
          >
            <div
              style={{
                height: '100%',
                width: `${usagePercent}%`,
                borderRadius: 8,
                background: `linear-gradient(90deg, ${C.sea400}, ${C.sea600})`,
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* ── Search + Filter Controls ───────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 220px',
              minWidth: 180,
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                lineHeight: 0,
              }}
            >
              <IconSearch size={15} color={C.textMuted} />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Пошук файлів..."
              style={{
                width: '100%',
                height: 38,
                paddingLeft: 36,
                paddingRight: 12,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                background: C.bgCard,
                fontSize: 13,
                color: C.textPrimary,
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = C.sea400 }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = C.border }}
              aria-label="Пошук файлів"
            />
          </div>

          {/* MIME type filter */}
          <select
            value={mimeFilter}
            onChange={(e) => { setMimeFilter(e.target.value); setPage(1) }}
            style={{
              height: 38,
              padding: '0 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              background: C.bgCard,
              fontSize: 13,
              color: C.textPrimary,
              cursor: 'pointer',
              outline: 'none',
              minWidth: 130,
            }}
            aria-label="Тип файлу"
          >
            <option value="">Всі типи</option>
            <option value="image">Зображення</option>
            <option value="video">Відео</option>
            <option value="application/pdf">Документи</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1) }}
            style={{
              height: 38,
              padding: '0 12px',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              background: C.bgCard,
              fontSize: 13,
              color: C.textPrimary,
              cursor: 'pointer',
              outline: 'none',
              minWidth: 130,
            }}
            aria-label="Сортування"
          >
            <option value="-createdAt">Найновіші</option>
            <option value="createdAt">Найстаріші</option>
            <option value="filename">За назвою</option>
            <option value="-filesize">За розміром</option>
          </select>

          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              overflow: 'hidden',
              flexShrink: 0,
            }}
            role="group"
            aria-label="Режим перегляду"
          >
            {(['grid', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                title={mode === 'grid' ? 'Сітка' : 'Список'}
                style={{
                  width: 38,
                  height: 38,
                  border: 'none',
                  background: viewMode === mode ? C.sea500 : C.bgCard,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
                aria-pressed={viewMode === mode}
                aria-label={mode === 'grid' ? 'Вигляд сітки' : 'Вигляд списку'}
              >
                {mode === 'grid'
                  ? <IconGrid size={15} color={viewMode === mode ? '#ffffff' : C.textSecondary} />
                  : <IconList size={15} color={viewMode === mode ? '#ffffff' : C.textSecondary} />
                }
              </button>
            ))}
          </div>
        </div>

        {/* ── Folders Section ────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Папки
            <span style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, background: C.bgSecondary, padding: '2px 8px', borderRadius: 10 }}>
              {FOLDERS.length}
            </span>
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 12,
            }}
          >
            {FOLDERS.map((folder) => (
              <FolderCard key={folder.name} {...folder} />
            ))}
          </div>
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 12,
              padding: '14px 18px',
              color: '#dc2626',
              fontSize: 13,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
            role="alert"
          >
            <span style={{ fontSize: 16 }}>!</span>
            {error}
            <button
              onClick={() => fetchData()}
              style={{
                marginLeft: 'auto',
                border: '1px solid #fca5a5',
                borderRadius: 8,
                padding: '4px 12px',
                background: 'transparent',
                color: '#dc2626',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Спробувати знову
            </button>
          </div>
        )}

        {/* ── Media Files ────────────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            Файли
            {!loading && (
              <span style={{ fontSize: 12, fontWeight: 500, color: C.textMuted, background: C.bgSecondary, padding: '2px 8px', borderRadius: 10 }}>
                {totalDocs}
              </span>
            )}
          </h2>

          {/* Grid */}
          {viewMode === 'grid' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 14,
              }}
            >
              {loading
                ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
                : files.map((file) => (
                    <MediaCard
                      key={file.id}
                      file={file}
                      selected={selectedIds.has(file.id)}
                      viewMode="grid"
                      onToggleSelect={toggleSelect}
                      onDelete={handleDelete}
                    />
                  ))
              }
            </div>
          ) : (
            /* List view */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* List header */}
              {!loading && files.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '6px 14px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  <span style={{ width: 18 }} />
                  <span style={{ width: 48 }} />
                  <span style={{ flex: 1 }}>Назва</span>
                  <span style={{ minWidth: 64, textAlign: 'right' }}>Розмір</span>
                  <span style={{ minWidth: 80, textAlign: 'right' }}>Розширення</span>
                  <span style={{ minWidth: 90, textAlign: 'right' }}>Дата</span>
                  <span style={{ width: 28 }} />
                </div>
              )}

              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 64,
                        borderRadius: 12,
                        background: `linear-gradient(90deg, ${C.bgSecondary} 25%, #edf0f2 50%, ${C.bgSecondary} 75%)`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                      aria-hidden="true"
                    />
                  ))
                : files.map((file) => (
                    <MediaCard
                      key={file.id}
                      file={file}
                      selected={selectedIds.has(file.id)}
                      viewMode="list"
                      onToggleSelect={toggleSelect}
                      onDelete={handleDelete}
                    />
                  ))
              }
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && files.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 24px',
                color: C.textMuted,
              }}
            >
              <div style={{ marginBottom: 16, opacity: 0.4 }}>
                <IconCamera size={48} color={C.textMuted} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: C.textSecondary, margin: '0 0 6px' }}>
                Файли не знайдено
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                {search || mimeFilter
                  ? 'Спробуйте змінити параметри пошуку або фільтри'
                  : 'Завантажте перший файл, перетягнувши його вище'}
              </p>
            </div>
          )}
        </div>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginTop: 32,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={paginationBtnStyle(page <= 1)}
              aria-label="Попередня сторінка"
            >
              <IconChevronLeft size={14} color={page <= 1 ? C.textMuted : C.textSecondary} />
            </button>

            {buildPageRange(page, totalPages).map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} style={{ color: C.textMuted, fontSize: 13, padding: '0 4px' }}>
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  style={paginationBtnStyle(false, page === p)}
                  aria-current={page === p ? 'page' : undefined}
                  aria-label={`Сторінка ${p}`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={paginationBtnStyle(page >= totalPages)}
              aria-label="Наступна сторінка"
            >
              <IconChevronRight size={14} color={page >= totalPages ? C.textMuted : C.textSecondary} />
            </button>
          </div>
        )}

        {/* Load more (alternate UX when on page 1 and there are more pages) */}
        {!loading && totalPages > 1 && page < totalPages && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <button
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: '10px 28px',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                background: C.bgCard,
                fontSize: 13,
                fontWeight: 600,
                color: C.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Завантажити ще
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Folder card sub-component ─────────────────────────────────────────────────

interface FolderCardProps {
  name: string
  count: number
  color: string
  gradientFrom: string
  gradientTo: string
}

function FolderCard({ name, count, color, gradientFrom, gradientTo }: FolderCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${hovered ? C.sea400 : C.border}`,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 6px 24px rgba(91,196,196,0.12)' : '0 1px 4px rgba(45,55,64,0.04)',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Папка ${name} — ${count} файлів`}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconFolder color={color} />
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, lineHeight: 1.3 }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>
          {count} файлів
        </div>
      </div>
    </div>
  )
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function paginationBtnStyle(disabled: boolean, active = false): React.CSSProperties {
  return {
    minWidth: 34,
    height: 34,
    padding: '0 8px',
    border: `1px solid ${active ? C.sea500 : C.border}`,
    borderRadius: 8,
    background: active ? C.sea500 : disabled ? C.bgSecondary : C.bgCard,
    color: active ? '#ffffff' : disabled ? C.textMuted : C.textSecondary,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: disabled ? 'default' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.18s ease',
    opacity: disabled ? 0.5 : 1,
  }
}

function buildPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let p = start; p <= end; p++) pages.push(p)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
}
