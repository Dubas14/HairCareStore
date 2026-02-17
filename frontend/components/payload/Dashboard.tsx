'use client'

import React, { useEffect, useState } from 'react'
import {
  Package,
  ShoppingBag,
  Users,
  ShoppingCart,
  Layers,
  FileText,
  Megaphone,
  Award,
  LayoutGrid,
  BookOpen,
  ImageIcon,
  Star,
  Shield,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react'
import { getDashboardStats, type DashboardStats } from '@/app/actions/dashboard-stats'
import './Dashboard.scss'

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: number): string {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ── Static data ───────────────────────────────────────────────────────────────

const statusLabels: Record<string, { label: string; variant: string }> = {
  pending:         { label: 'В обробці',     variant: 'warning' },
  completed:       { label: 'Виконано',       variant: 'success' },
  canceled:        { label: 'Скасовано',      variant: 'danger'  },
  requires_action: { label: 'Потребує дій',   variant: 'warning' },
  archived:        { label: 'Архів',          variant: 'neutral' },
}

const paymentLabels: Record<string, { label: string; variant: string }> = {
  awaiting: { label: 'Очікує',    variant: 'warning' },
  paid:     { label: 'Оплачено',  variant: 'success' },
  refunded: { label: 'Повернено', variant: 'danger'  },
}

const sections = {
  shop: [
    { slug: 'products',   label: 'Товари',      desc: 'Каталог товарів',          icon: Package,      color: '#2a9d8f' },
    { slug: 'orders',     label: 'Замовлення',  desc: 'Управління замовленнями',  icon: ShoppingBag,  color: '#3b82f6' },
    { slug: 'customers',  label: 'Клієнти',     desc: 'База клієнтів',            icon: Users,        color: '#8b5cf6' },
    { slug: 'carts',      label: 'Кошики',      desc: 'Активні кошики',           icon: ShoppingCart, color: '#f59e0b' },
  ],
  content: [
    { slug: 'banners',      label: 'Банери',       desc: 'Слайдери та промо',    icon: Layers,    color: '#ec4899' },
    { slug: 'pages',        label: 'Сторінки',     desc: 'Статичні сторінки',    icon: FileText,  color: '#6366f1' },
    { slug: 'promo-blocks', label: 'Промо-блоки',  desc: 'Блоки на головній',    icon: Megaphone, color: '#f97316' },
  ],
  catalog: [
    { slug: 'brands',      label: 'Бренди',     desc: 'Виробники',           icon: Award,      color: '#eab308' },
    { slug: 'categories',  label: 'Категорії',  desc: 'Дерево категорій',    icon: LayoutGrid, color: '#14b8a6' },
    { slug: 'blog-posts',  label: 'Блог',       desc: 'Статті та поради',    icon: BookOpen,   color: '#a855f7' },
  ],
  system: [
    { slug: 'media',    label: 'Медіа',           desc: 'Зображення та файли',  icon: ImageIcon, color: '#06b6d4' },
    { slug: 'reviews',  label: 'Відгуки',         desc: 'Відгуки клієнтів',     icon: Star,      color: '#f59e0b' },
    { slug: 'users',    label: 'Адміністратори',  desc: 'Користувачі CMS',       icon: Shield,    color: '#64748b' },
  ],
}

const quickActions = [
  { label: 'Новий товар',   href: '/admin/collections/products/create', icon: Package  },
  { label: 'Нова сторінка', href: '/admin/collections/pages/create',    icon: FileText },
  { label: 'Новий банер',   href: '/admin/collections/banners/create',  icon: Layers   },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonBlock({ w, h, radius = 6 }: { w?: string; h?: string; radius?: number }) {
  return (
    <span
      className="hl-skel"
      style={{ width: w ?? '100%', height: h ?? '16px', borderRadius: radius }}
    />
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  href,
  loading,
  secondary,
}: {
  icon: React.FC<{ size?: number }>
  label: string
  value: string
  color: string
  href?: string
  loading: boolean
  secondary?: string
}) {
  const inner = (
    <div className="hl-kpi__inner">
      <div className="hl-kpi__icon-wrap" style={{ '--kpi-color': color } as React.CSSProperties}>
        <Icon size={22} />
      </div>
      <div className="hl-kpi__body">
        {loading ? (
          <>
            <SkeletonBlock w="80px" h="32px" radius={8} />
            <SkeletonBlock w="100px" h="13px" />
          </>
        ) : (
          <>
            <span className="hl-kpi__value">{value}</span>
            <span className="hl-kpi__label">{label}</span>
            {secondary && <span className="hl-kpi__secondary">{secondary}</span>}
          </>
        )}
      </div>
      {href && !loading && (
        <ArrowUpRight size={14} className="hl-kpi__arrow" />
      )}
    </div>
  )

  if (href) {
    return (
      <a href={href} className="hl-kpi hl-kpi--link" style={{ '--kpi-color': color } as React.CSSProperties}>
        {inner}
      </a>
    )
  }
  return (
    <div className="hl-kpi" style={{ '--kpi-color': color } as React.CSSProperties}>
      {inner}
    </div>
  )
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  return <span className={`hl-badge hl-badge--${variant}`}>{children}</span>
}

function OrdersTableSkeleton() {
  return (
    <div className="hl-orders__table-wrap">
      <table className="hl-orders__table">
        <thead>
          <tr>
            {['Номер', 'Клієнт', 'Сума', 'Статус', 'Оплата', 'Дата'].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={i}>
              <td><SkeletonBlock w="48px" h="14px" /></td>
              <td><SkeletonBlock w="160px" h="14px" /></td>
              <td><SkeletonBlock w="80px" h="14px" /></td>
              <td><SkeletonBlock w="90px" h="22px" radius={6} /></td>
              <td><SkeletonBlock w="80px" h="22px" radius={6} /></td>
              <td><SkeletonBlock w="70px" h="14px" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NavGroupCard({
  title,
  items,
}: {
  title: string
  items: typeof sections.shop
}) {
  return (
    <div className="hl-nav-group">
      <div className="hl-nav-group__header">
        <span className="hl-nav-group__title">{title}</span>
      </div>
      <ul className="hl-nav-group__list">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.slug}>
              <a
                href={`/admin/collections/${item.slug}`}
                className="hl-nav-row"
              >
                <span
                  className="hl-nav-row__icon"
                  style={{ '--nav-color': item.color } as React.CSSProperties}
                >
                  <Icon size={16} />
                </span>
                <span className="hl-nav-row__text">
                  <span className="hl-nav-row__label">{item.label}</span>
                  <span className="hl-nav-row__desc">{item.desc}</span>
                </span>
                <ChevronRight size={14} className="hl-nav-row__chevron" />
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="hl-dash">

      {/* ── Header ── */}
      <header className="hl-dash__header">
        <div className="hl-dash__heading">
          <h1 className="hl-dash__title">Панель управління</h1>
          <p className="hl-dash__subtitle">HAIR LAB — професійна косметика</p>
        </div>
        <nav className="hl-dash__quick-actions" aria-label="Швидкі дії">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <a key={action.href} href={action.href} className="hl-dash__qa-btn">
                <Plus size={13} />
                {action.label}
              </a>
            )
          })}
        </nav>
      </header>

      {/* ── KPI Row ── */}
      <section className="hl-dash__kpis" aria-label="Ключові показники">
        <KpiCard
          icon={Package}
          label="Активні товари"
          value={String(stats?.productsCount ?? 0)}
          color="#2a9d8f"
          href="/admin/collections/products"
          loading={loading}
        />
        <KpiCard
          icon={ShoppingBag}
          label="Замовлення"
          value={String(stats?.ordersCount ?? 0)}
          color="#3b82f6"
          href="/admin/collections/orders"
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Загальний дохід"
          value={formatPrice(stats?.revenue ?? 0)}
          color="#10b981"
          loading={loading}
        />
        <KpiCard
          icon={Users}
          label="Клієнти"
          value={String(stats?.customersCount ?? 0)}
          color="#8b5cf6"
          href="/admin/collections/customers"
          loading={loading}
          secondary={stats ? `Відгуки: ${stats.reviewsCount}` : undefined}
        />
      </section>

      {/* ── Recent Orders ── */}
      <section className="hl-dash__section" aria-label="Останні замовлення">
        <div className="hl-dash__section-head">
          <h2 className="hl-dash__section-title">Останні замовлення</h2>
          <a href="/admin/collections/orders" className="hl-dash__see-all">
            Всі замовлення
            <ArrowUpRight size={13} />
          </a>
        </div>

        {loading ? (
          <OrdersTableSkeleton />
        ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="hl-orders__table-wrap">
            <table className="hl-orders__table">
              <thead>
                <tr>
                  <th>Номер</th>
                  <th>Клієнт</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th>Оплата</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const statusInfo  = statusLabels[order.status]  ?? { label: order.status,        variant: 'neutral' }
                  const paymentInfo = paymentLabels[order.paymentStatus] ?? { label: order.paymentStatus, variant: 'neutral' }
                  return (
                    <tr
                      key={order.id}
                      className="hl-orders__row"
                      onClick={() => { window.location.href = `/admin/collections/orders/${order.id}` }}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          window.location.href = `/admin/collections/orders/${order.id}`
                        }
                      }}
                      role="link"
                      aria-label={`Замовлення #${order.displayId}`}
                    >
                      <td>
                        <span className="hl-orders__id">#{order.displayId}</span>
                      </td>
                      <td>
                        <span className="hl-orders__email">{order.email}</span>
                      </td>
                      <td>
                        <span className="hl-orders__total">{formatPrice(order.total)}</span>
                      </td>
                      <td>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td>
                        <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                      </td>
                      <td>
                        <span className="hl-orders__date">{formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="hl-orders__empty">Замовлень поки немає</div>
        )}
      </section>

      {/* ── Quick Navigation ── */}
      <section className="hl-dash__section" aria-label="Навігація">
        <div className="hl-dash__section-head">
          <h2 className="hl-dash__section-title">Розділи</h2>
        </div>
        <div className="hl-nav-grid">
          <NavGroupCard title="Магазин"  items={sections.shop}    />
          <NavGroupCard title="Контент"  items={sections.content} />
          <NavGroupCard title="Каталог"  items={sections.catalog} />
          <NavGroupCard title="Система"  items={sections.system}  />
        </div>
      </section>

    </div>
  )
}

export default Dashboard
