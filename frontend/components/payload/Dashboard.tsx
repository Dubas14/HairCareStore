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

function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block animate-pulse bg-gray-200 rounded-md ${className}`} />
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
    <>
      <div
        className="absolute inset-x-0 top-0 h-[3px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: color }}
      />
      <div className="flex items-start gap-4 p-5 relative">
        <div
          className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}1a`, color }}
        >
          <Icon size={22} />
        </div>
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {loading ? (
            <>
              <Skeleton className="w-20 h-8" />
              <Skeleton className="w-24 h-3.5" />
            </>
          ) : (
            <>
              <span className="text-[28px] font-bold leading-none tracking-tight text-gray-900 truncate">
                {value}
              </span>
              <span className="text-[13px] text-gray-500 mt-0.5">{label}</span>
              {secondary && (
                <span className="text-[11.5px] text-gray-400 mt-1 font-mono">{secondary}</span>
              )}
            </>
          )}
        </div>
        {href && !loading && (
          <ArrowUpRight
            size={14}
            className="absolute top-5 right-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-px group-hover:-translate-y-px"
          />
        )}
      </div>
    </>
  )

  const cls =
    'group relative bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5'

  if (href) {
    return (
      <a href={href} className={`${cls} block no-underline text-inherit cursor-pointer`}>
        {inner}
      </a>
    )
  }
  return <div className={cls}>{inner}</div>
}

const badgeVariants: Record<string, string> = {
  success: 'bg-emerald-500/10 text-emerald-800 before:bg-emerald-500',
  warning: 'bg-amber-500/10 text-amber-800 before:bg-amber-500',
  danger:  'bg-red-500/10 text-red-800 before:bg-red-500',
  neutral: 'bg-gray-500/10 text-gray-700 before:bg-gray-400',
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11.5px] font-semibold whitespace-nowrap before:content-[''] before:w-[5px] before:h-[5px] before:rounded-full before:flex-shrink-0 ${badgeVariants[variant] ?? badgeVariants.neutral}`}
    >
      {children}
    </span>
  )
}

const thCls = 'px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-wider text-gray-400 text-left whitespace-nowrap'

function OrdersTableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full border-collapse text-[13px] min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Номер', 'Клієнт', 'Сума', 'Статус', 'Оплата', 'Дата'].map((h) => (
              <th key={h} className={thCls}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-b-0">
              <td className="px-4 py-3"><Skeleton className="w-12 h-3.5" /></td>
              <td className="px-4 py-3"><Skeleton className="w-40 h-3.5" /></td>
              <td className="px-4 py-3"><Skeleton className="w-20 h-3.5" /></td>
              <td className="px-4 py-3"><Skeleton className="w-[90px] h-[22px]" /></td>
              <td className="px-4 py-3"><Skeleton className="w-20 h-[22px]" /></td>
              <td className="px-4 py-3"><Skeleton className="w-[70px] h-3.5" /></td>
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-[18px] pt-3.5 pb-3 border-b border-gray-100">
        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      </div>
      <ul className="list-none m-0 py-1.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.slug}>
              <a
                href={`/admin/collections/${item.slug}`}
                className="group/row flex items-center gap-3 px-[18px] py-2.5 no-underline text-inherit transition-colors hover:bg-[#f8fffe] focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-[-2px]"
              >
                <span
                  className="w-[34px] h-[34px] rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}1a`, color: item.color }}
                >
                  <Icon size={16} />
                </span>
                <span className="flex flex-col min-w-0 flex-1 gap-px">
                  <span className="text-[13.5px] font-semibold text-gray-900 group-hover/row:text-teal-600 transition-colors truncate">
                    {item.label}
                  </span>
                  <span className="text-[11.5px] text-gray-400 truncate">{item.desc}</span>
                </span>
                <ChevronRight
                  size={14}
                  className="flex-shrink-0 text-gray-300 opacity-0 group-hover/row:opacity-100 group-hover/row:text-teal-500 group-hover/row:translate-x-0.5 transition-all"
                />
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
    <div className="font-sans max-w-screen-xl pb-14 text-gray-900">

      {/* ── Header ── */}
      <header className="flex items-center justify-between gap-5 flex-wrap mb-8 pb-6 border-b border-gray-200">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold tracking-tight text-gray-900 m-0 leading-tight">
            Панель управління
          </h1>
          <p className="text-[13px] text-gray-500 m-0">HAIR LAB — професійна косметика</p>
        </div>
        <nav className="flex items-center gap-2 flex-wrap" aria-label="Швидкі дії">
          {quickActions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[12.5px] font-medium text-teal-600 bg-teal-500/[0.08] border border-teal-500/[0.22] rounded-full no-underline whitespace-nowrap transition-all hover:bg-teal-500/[0.14] hover:border-teal-500/40 hover:-translate-y-px hover:shadow-[0_3px_10px_rgba(42,157,143,0.12)] active:translate-y-0"
            >
              <Plus size={13} />
              {action.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ── KPI Row ── */}
      <section
        className="grid grid-cols-4 gap-3.5 mb-9 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1"
        aria-label="Ключові показники"
      >
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
      <section className="mb-9" aria-label="Останні замовлення">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 m-0">
            Останні замовлення
          </h2>
          <a
            href="/admin/collections/orders"
            className="inline-flex items-center gap-1 text-[12.5px] font-medium text-teal-600 no-underline hover:text-teal-700 transition-colors"
          >
            Всі замовлення
            <ArrowUpRight size={13} />
          </a>
        </div>

        {loading ? (
          <OrdersTableSkeleton />
        ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={thCls}>Номер</th>
                  <th className={thCls}>Клієнт</th>
                  <th className={`${thCls} !text-right`}>Сума</th>
                  <th className={thCls}>Статус</th>
                  <th className={thCls}>Оплата</th>
                  <th className={thCls}>Дата</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const statusInfo  = statusLabels[order.status]  ?? { label: order.status,        variant: 'neutral' }
                  const paymentInfo = paymentLabels[order.paymentStatus] ?? { label: order.paymentStatus, variant: 'neutral' }
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors hover:bg-[#f8fffe] focus-visible:outline-2 focus-visible:outline-teal-500 focus-visible:outline-offset-[-2px]"
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
                      <td className="px-4 py-3 align-middle">
                        <span className="font-mono text-xs font-semibold text-teal-600">#{order.displayId}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="text-gray-500 max-w-[220px] block truncate">{order.email}</span>
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <span className="font-mono font-semibold text-[13px] text-gray-900">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <Badge variant={paymentInfo.variant}>{paymentInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="text-gray-400 text-xs whitespace-nowrap">{formatDate(order.createdAt)}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl py-10 px-6 text-center text-gray-400 text-sm">
            Замовлень поки немає
          </div>
        )}
      </section>

      {/* ── Quick Navigation ── */}
      <section className="mb-9" aria-label="Навігація">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 m-0">Розділи</h2>
        </div>
        <div className="grid grid-cols-2 gap-3.5 max-[640px]:grid-cols-1">
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
