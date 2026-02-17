'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCollectionListData, deleteCollectionDoc } from '@/app/actions/admin-views'
import { StatsCards, type StatItem } from './StatsCards'
import { FilterChips, type FilterOption } from './FilterChips'
import { CustomTable, type Column } from './CustomTable'

// ─── Collection Meta ──────────────────────────────────────────────────────────

const COLLECTION_LABELS: Record<string, { title: string; singular: string }> = {
  products: { title: 'Товари', singular: 'товар' },
  categories: { title: 'Категорії', singular: 'категорію' },
  brands: { title: 'Бренди', singular: 'бренд' },
  orders: { title: 'Замовлення', singular: 'замовлення' },
  customers: { title: 'Клієнти', singular: 'клієнта' },
  reviews: { title: 'Відгуки', singular: 'відгук' },
  pages: { title: 'Сторінки', singular: 'сторінку' },
  'blog-posts': { title: 'Блог', singular: 'статтю' },
  'promo-blocks': { title: 'Промо блоки', singular: 'блок' },
  banners: { title: 'Банери', singular: 'банер' },
  media: { title: 'Медіа', singular: 'файл' },
  users: { title: 'Користувачі', singular: 'користувача' },
  'loyalty-points': { title: 'Лояльність', singular: 'запис' },
  'loyalty-transactions': { title: 'Транзакції лояльності', singular: 'транзакцію' },
}

const SORT_OPTIONS = [
  { value: '-updatedAt', label: 'Новіші' },
  { value: 'updatedAt', label: 'Старіші' },
  { value: 'title', label: 'Назва: А-Я' },
  { value: '-title', label: 'Назва: Я-А' },
  { value: '-createdAt', label: 'Дата створення' },
]

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconSearch() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function IconFile() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function IconArchive() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  )
}

function IconChevronLeft() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: 'active', published: 'active', completed: 'active',
    draft: 'draft', pending: 'draft', processing: 'draft',
    archived: 'archived', cancelled: 'archived', inactive: 'archived',
  }
  const variant = map[status] || 'muted'
  const labels: Record<string, string> = {
    active: 'Активний', published: 'Опублікований', completed: 'Завершений',
    draft: 'Чернетка', pending: 'Очікує', processing: 'В обробці',
    archived: 'Архів', cancelled: 'Скасований', inactive: 'Неактивний',
  }
  return (
    <span className={`hl-status-badge hl-status-badge--${variant}`}>
      <span className="hl-status-badge__dot" />
      {labels[status] || status}
    </span>
  )
}

// ─── Column Definitions ───────────────────────────────────────────────────────

function getColumns(slug: string): Column[] {
  const statusCol: Column = {
    key: 'status',
    label: 'Статус',
    width: '130px',
    render: (val: string) => val ? <StatusBadge status={val} /> : <span style={{ color: '#9aa5ab' }}>—</span>,
  }

  const dateCol: Column = {
    key: 'updatedAt',
    label: 'Оновлено',
    width: '130px',
  }

  switch (slug) {
    case 'categories':
      return [
        { key: 'title', label: 'Назва', render: (v: string) => <strong style={{ color: '#2d3740' }}>{v}</strong> },
        { key: 'slug', label: 'Slug', width: '180px' },
        statusCol,
        dateCol,
      ]
    case 'brands':
      return [
        { key: 'name', label: 'Назва', render: (v: string) => <strong style={{ color: '#2d3740' }}>{v}</strong> },
        { key: 'slug', label: 'Slug', width: '180px' },
        { key: 'country', label: 'Країна', width: '120px' },
        statusCol,
        dateCol,
      ]
    case 'orders':
      return [
        { key: 'orderNumber', label: '№ Замовлення', width: '140px', render: (v: string) => <strong style={{ color: '#2d3740' }}>#{v}</strong> },
        { key: 'customer', label: 'Клієнт', render: (v: any) => v?.name || v?.email || '—' },
        { key: 'total', label: 'Сума', width: '110px', render: (v: number) => v != null ? `₴${v.toLocaleString('uk-UA')}` : '—' },
        statusCol,
        dateCol,
      ]
    case 'customers':
      return [
        { key: 'name', label: 'Ім\'я', render: (v: string) => <strong style={{ color: '#2d3740' }}>{v}</strong> },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Телефон', width: '140px' },
        dateCol,
      ]
    case 'reviews':
      return [
        { key: 'product', label: 'Товар', render: (v: any) => v?.title || '—' },
        { key: 'author', label: 'Автор', width: '150px' },
        { key: 'rating', label: 'Оцінка', width: '80px', render: (v: number) => v != null ? '★'.repeat(v) + '☆'.repeat(5 - v) : '—' },
        statusCol,
        dateCol,
      ]
    case 'pages':
    case 'blog-posts':
      return [
        { key: 'title', label: 'Заголовок', render: (v: string) => <strong style={{ color: '#2d3740' }}>{v}</strong> },
        { key: 'slug', label: 'Slug', width: '180px' },
        statusCol,
        dateCol,
      ]
    case 'users':
      return [
        { key: 'email', label: 'Email', render: (v: string) => <strong style={{ color: '#2d3740' }}>{v}</strong> },
        { key: 'name', label: 'Ім\'я' },
        dateCol,
      ]
    case 'promo-blocks':
      return [
        { key: 'title', label: 'Назва', render: (v: string) => <strong style={{ color: '#2d3740' }}>{v}</strong> },
        { key: 'type', label: 'Тип', width: '120px' },
        statusCol,
        dateCol,
      ]
    default:
      return [
        { key: 'title', label: 'Назва', render: (v: string, doc: any) => <strong style={{ color: '#2d3740' }}>{v || doc.name || doc.email || `ID: ${doc.id}`}</strong> },
        statusCol,
        dateCol,
      ]
  }
}

// ─── Pagination Builder ───────────────────────────────────────────────────────

function buildPages(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomListView() {
  const router = useRouter()
  const [slug, setSlug] = useState('')
  const [docs, setDocs] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, draft: 0, archived: 0 })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState('-updatedAt')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Extract slug from URL
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/admin\/collections\/([^/]+)/)
    if (match) setSlug(match[1])
  }, [])

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!slug) return
    setIsLoading(true)
    try {
      const result = await getCollectionListData(slug, { page, limit: 15, search: search || undefined, sort, status })
      setDocs(result.docs)
      setTotalPages(result.totalPages)
      setStats(result.stats)
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [slug, page, search, sort, status])

  useEffect(() => { fetchData() }, [fetchData])

  // Debounced search
  const handleSearch = (val: string) => {
    setSearch(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1) }, 300)
  }

  // Show toast
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Delete handler (CustomTable calls onDelete with id and shows its own confirm)
  const handleDelete = async (id: string | number) => {
    const result = await deleteCollectionDoc(slug, id)
    if (result.success) {
      showToast('Документ видалено')
      fetchData()
    } else {
      showToast(result.error || 'Помилка видалення', 'error')
    }
  }

  const meta = COLLECTION_LABELS[slug] || { title: slug, singular: 'запис' }
  const columns = getColumns(slug)

  const statsItems: StatItem[] = [
    { label: 'Всього', value: stats.total, color: 'sea', icon: <IconPackage /> },
    { label: 'Активні', value: stats.active, color: 'success', icon: <IconCheck /> },
    { label: 'Чернетки', value: stats.draft, color: 'warning', icon: <IconFile /> },
    { label: 'Архів', value: stats.archived, color: 'muted', icon: <IconArchive /> },
  ]

  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'Всі', count: stats.total },
    { value: 'active', label: 'Активні', count: stats.active },
    { value: 'draft', label: 'Чернетки', count: stats.draft },
    { value: 'archived', label: 'Архів', count: stats.archived },
  ]

  const pages = buildPages(page, totalPages)

  return (
    <div className="hl-list-view">
      {/* Header */}
      <div className="hl-list-header">
        <div>
          <div className="hl-list-header__title">{meta.title}</div>
          <div className="hl-list-header__subtitle">{stats.total} записів у колекції</div>
        </div>
        <div className="hl-list-header__actions">
          <button
            className="hl-btn hl-btn--primary"
            onClick={() => router.push(`/admin/collections/${slug}/create`)}
          >
            <IconPlus /> Додати {meta.singular}
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards stats={statsItems} />

      {/* Filters */}
      <FilterChips options={filterOptions} activeValue={status} onChange={(v) => { setStatus(v); setPage(1) }} />

      {/* Controls */}
      <div className="hl-controls-bar">
        <div className="hl-controls-bar__search">
          <span className="hl-controls-bar__search-icon"><IconSearch /></span>
          <input
            className="hl-controls-bar__search-input"
            type="text"
            placeholder={`Пошук ${meta.title.toLowerCase()}...`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <select
          className="hl-controls-bar__sort"
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1) }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <CustomTable
        columns={columns}
        docs={docs}
        isLoading={isLoading}
        onRowClick={(doc) => router.push(`/admin/collections/${slug}/${doc.id}`)}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="hl-pagination">
          <button
            className="hl-pagination__btn"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <IconChevronLeft />
          </button>
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} className="hl-pagination__ellipsis">...</span>
            ) : (
              <button
                key={p}
                className={`hl-pagination__btn ${page === p ? 'hl-pagination__btn--active' : ''}`}
                onClick={() => setPage(p as number)}
              >
                {p}
              </button>
            )
          )}
          <button
            className="hl-pagination__btn"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            <IconChevronRight />
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`hl-toast hl-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}
