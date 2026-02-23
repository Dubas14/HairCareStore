'use client'

import React, { useCallback, useEffect, useState } from 'react'
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
  AlertTriangle,
  Trophy,
  RotateCcw,
  BarChart3,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  getDashboardStats,
  getRevenueOverTime,
  getOrdersByStatus,
  getTopProducts,
  getLowStockProducts,
  getAbandonedCartStats,
  type DashboardStats,
  type RevenueDataPoint,
  type OrderStatusBreakdown,
  type TopProduct,
  type LowStockItem,
  type AbandonedCartStats,
} from '@/app/actions/dashboard-stats'

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

// ── Widget Sub-components ────────────────────────────────────────────────────

function WidgetCard({
  title,
  icon: Icon,
  action,
  children,
  loading,
}: {
  title: string
  icon?: React.FC<{ size?: number }>
  action?: React.ReactNode
  children: React.ReactNode
  loading?: boolean
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={15} />}
          <span className="text-[13px] font-semibold text-gray-700">{title}</span>
        </div>
        {action}
      </div>
      <div className="px-5 pb-5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <span className="inline-block w-6 h-6 border-2 border-gray-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

type RevenuePeriod = 'daily' | 'weekly' | 'monthly'
const periodOptions: { value: RevenuePeriod; label: string }[] = [
  { value: 'daily', label: 'День' },
  { value: 'weekly', label: 'Тиждень' },
  { value: 'monthly', label: 'Місяць' },
]

function PeriodToggle({
  value,
  onChange,
}: {
  value: RevenuePeriod
  onChange: (v: RevenuePeriod) => void
}) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      {periodOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
            value === opt.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function RevenueChartWidget({
  data,
  loading,
  period,
  onPeriodChange,
}: {
  data: RevenueDataPoint[]
  loading: boolean
  period: RevenuePeriod
  onPeriodChange: (v: RevenuePeriod) => void
}) {
  return (
    <WidgetCard
      title="Динаміка доходу"
      icon={BarChart3}
      loading={loading}
      action={<PeriodToggle value={period} onChange={onPeriodChange} />}
    >
      {data.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">Немає даних за обраний період</div>
      ) : (
        <div className="h-[260px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                width={45}
              />
              <RechartsTooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={((value?: number, name?: string) => [
                  name === 'revenue' ? formatPrice(value ?? 0) : (value ?? 0),
                  name === 'revenue' ? 'Дохід' : 'Замовлення',
                ]) as never}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2a9d8f"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </WidgetCard>
  )
}

function OrdersOverviewWidget({
  data,
  loading,
}: {
  data: OrderStatusBreakdown[]
  loading: boolean
}) {
  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <WidgetCard title="Замовлення за статусом" icon={ShoppingBag} loading={loading}>
      {data.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">Замовлень поки немає</div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-[180px] h-[180px] flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  content={() => null}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-[22px] font-bold text-gray-900">{total}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">всього</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {data.map((item) => (
              <div key={item.status} className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-[12.5px] text-gray-600 flex-1 truncate">{item.label}</span>
                <span className="text-[13px] font-semibold text-gray-900 font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}

function TopProductsWidget({
  data,
  loading,
}: {
  data: TopProduct[]
  loading: boolean
}) {
  return (
    <WidgetCard title="Топ товарів" icon={Trophy} loading={loading}>
      {data.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">Немає даних про продажі</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.map((p, i) => (
            <a
              key={p.id}
              href={p.handle ? `/admin/collections/products/${p.id}` : '#'}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg no-underline text-inherit transition-colors hover:bg-gray-50"
            >
              <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-400 flex-shrink-0">
                {i + 1}
              </span>
              {p.thumbnail ? (
                <img
                  src={p.thumbnail}
                  alt=""
                  className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                />
              ) : (
                <span className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-gray-300" />
                </span>
              )}
              <span className="flex-1 min-w-0 text-[12.5px] font-medium text-gray-700 truncate">
                {p.title}
              </span>
              <span className="text-[11px] text-gray-400 flex-shrink-0">{p.totalQuantity} шт.</span>
              <span className="text-[12px] font-semibold font-mono text-gray-900 flex-shrink-0">
                {formatPrice(p.totalRevenue)}
              </span>
            </a>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}

function LowStockWidget({
  data,
  loading,
}: {
  data: LowStockItem[]
  loading: boolean
}) {
  return (
    <WidgetCard title="Низький запас" icon={AlertTriangle} loading={loading}>
      {data.length === 0 ? (
        <div className="text-center text-gray-400 text-sm py-8">Всі товари в достатній кількості</div>
      ) : (
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto -mx-1 px-1">
          {data.map((item, i) => {
            const severity =
              item.inventory === 0
                ? 'bg-red-50 border-red-200 text-red-700'
                : item.inventory <= 2
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
            const dotColor =
              item.inventory === 0
                ? 'bg-red-500'
                : item.inventory <= 2
                  ? 'bg-amber-500'
                  : 'bg-gray-400'

            return (
              <a
                key={`${item.productId}-${item.variantTitle}-${i}`}
                href={`/admin/collections/products/${item.productId}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border no-underline transition-colors hover:shadow-sm ${severity}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[12px] font-medium truncate">{item.productTitle}</span>
                  {item.variantTitle && (
                    <span className="block text-[10.5px] opacity-70 truncate">{item.variantTitle}</span>
                  )}
                </span>
                {item.sku && (
                  <span className="text-[10px] font-mono opacity-50 flex-shrink-0">{item.sku}</span>
                )}
                <span className="text-[13px] font-bold flex-shrink-0 font-mono">
                  {item.inventory}
                </span>
              </a>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}

function AbandonedCartsWidget({
  data,
  loading,
}: {
  data: AbandonedCartStats | null
  loading: boolean
}) {
  const metrics = data
    ? [
        { label: 'Покинуті кошики', value: String(data.abandonedCount), icon: ShoppingCart, color: '#f59e0b' },
        { label: 'Втрачена вартість', value: formatPrice(data.abandonedValue), icon: TrendingUp, color: '#ef4444' },
        { label: 'Відновлено', value: String(data.recoveredCount), icon: RotateCcw, color: '#10b981' },
        { label: 'Коефіцієнт повернення', value: `${data.recoveryRate.toFixed(1)}%`, icon: BarChart3, color: '#3b82f6' },
      ]
    : []

  return (
    <WidgetCard title="Покинуті кошики" icon={ShoppingCart} loading={loading}>
      {!data || (data.abandonedCount === 0 && data.recoveredCount === 0) ? (
        <div className="text-center text-gray-400 text-sm py-8">Покинутих кошиків немає</div>
      ) : (
        <div className="grid grid-cols-4 gap-3 max-[700px]:grid-cols-2">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.label}
                className="bg-gray-50 rounded-lg p-3.5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center"
                    style={{ background: `${m.color}1a`, color: m.color }}
                  >
                    <Icon size={14} />
                  </span>
                </div>
                <span className="text-[18px] font-bold text-gray-900 font-mono leading-none">
                  {m.value}
                </span>
                <span className="text-[11px] text-gray-400">{m.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </WidgetCard>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Analytics states
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('daily')
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([])
  const [revenueLoading, setRevenueLoading] = useState(true)
  const [ordersBreakdown, setOrdersBreakdown] = useState<OrderStatusBreakdown[]>([])
  const [ordersBreakdownLoading, setOrdersBreakdownLoading] = useState(true)
  const [topProductsData, setTopProductsData] = useState<TopProduct[]>([])
  const [topProductsLoading, setTopProductsLoading] = useState(true)
  const [lowStockData, setLowStockData] = useState<LowStockItem[]>([])
  const [lowStockLoading, setLowStockLoading] = useState(true)
  const [abandonedStats, setAbandonedStats] = useState<AbandonedCartStats | null>(null)
  const [abandonedLoading, setAbandonedLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))

    // Load analytics in parallel
    getOrdersByStatus()
      .then(setOrdersBreakdown)
      .catch(console.error)
      .finally(() => setOrdersBreakdownLoading(false))

    getTopProducts(10)
      .then(setTopProductsData)
      .catch(console.error)
      .finally(() => setTopProductsLoading(false))

    getLowStockProducts()
      .then(setLowStockData)
      .catch(console.error)
      .finally(() => setLowStockLoading(false))

    getAbandonedCartStats()
      .then(setAbandonedStats)
      .catch(console.error)
      .finally(() => setAbandonedLoading(false))
  }, [])

  // Revenue chart: load on mount and when period changes
  const loadRevenue = useCallback((period: RevenuePeriod) => {
    setRevenueLoading(true)
    getRevenueOverTime(period)
      .then(setRevenueData)
      .catch(console.error)
      .finally(() => setRevenueLoading(false))
  }, [])

  useEffect(() => {
    loadRevenue(revenuePeriod)
  }, [revenuePeriod, loadRevenue])

  const handlePeriodChange = useCallback((p: RevenuePeriod) => {
    setRevenuePeriod(p)
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

      {/* ── Analytics Row 1: Revenue + Orders Breakdown ── */}
      <section className="grid grid-cols-2 gap-3.5 mb-6 max-[800px]:grid-cols-1" aria-label="Аналітика доходу">
        <RevenueChartWidget
          data={revenueData}
          loading={revenueLoading}
          period={revenuePeriod}
          onPeriodChange={handlePeriodChange}
        />
        <OrdersOverviewWidget data={ordersBreakdown} loading={ordersBreakdownLoading} />
      </section>

      {/* ── Analytics Row 2: Top Products + Low Stock ── */}
      <section className="grid grid-cols-2 gap-3.5 mb-6 max-[800px]:grid-cols-1" aria-label="Товарна аналітика">
        <TopProductsWidget data={topProductsData} loading={topProductsLoading} />
        <LowStockWidget data={lowStockData} loading={lowStockLoading} />
      </section>

      {/* ── Analytics Row 3: Abandoned Carts ── */}
      <section className="mb-9" aria-label="Покинуті кошики">
        <AbandonedCartsWidget data={abandonedStats} loading={abandonedLoading} />
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
