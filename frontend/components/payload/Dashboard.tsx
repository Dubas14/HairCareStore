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
  Loader2,
} from 'lucide-react'
import { getDashboardStats, type DashboardStats } from '@/app/actions/dashboard-stats'
import './Dashboard.scss'

const statusLabels: Record<string, string> = {
  pending: 'В обробці',
  completed: 'Виконано',
  canceled: 'Скасовано',
  requires_action: 'Потребує дій',
  archived: 'Архів',
}

const paymentLabels: Record<string, string> = {
  awaiting: 'Очікує',
  paid: 'Оплачено',
  refunded: 'Повернено',
}

const sections = {
  shop: [
    { slug: 'products', label: 'Товари', desc: 'Каталог товарів', icon: Package, color: '#2a9d8f' },
    { slug: 'orders', label: 'Замовлення', desc: 'Управління замовленнями', icon: ShoppingBag, color: '#3b82f6' },
    { slug: 'customers', label: 'Клієнти', desc: 'База клієнтів', icon: Users, color: '#8b5cf6' },
    { slug: 'carts', label: 'Кошики', desc: 'Активні кошики', icon: ShoppingCart, color: '#f59e0b' },
  ],
  content: [
    { slug: 'banners', label: 'Банери', desc: 'Слайдери та промо', icon: Layers, color: '#ec4899' },
    { slug: 'pages', label: 'Сторінки', desc: 'Статичні сторінки', icon: FileText, color: '#6366f1' },
    { slug: 'promo-blocks', label: 'Промо-блоки', desc: 'Блоки на головній', icon: Megaphone, color: '#f97316' },
  ],
  catalog: [
    { slug: 'brands', label: 'Бренди', desc: 'Виробники', icon: Award, color: '#eab308' },
    { slug: 'categories', label: 'Категорії', desc: 'Дерево категорій', icon: LayoutGrid, color: '#14b8a6' },
    { slug: 'blog-posts', label: 'Блог', desc: 'Статті та поради', icon: BookOpen, color: '#a855f7' },
  ],
  system: [
    { slug: 'media', label: 'Медіа', desc: 'Зображення та файли', icon: ImageIcon, color: '#06b6d4' },
    { slug: 'reviews', label: 'Відгуки', desc: 'Відгуки клієнтів', icon: Star, color: '#f59e0b' },
    { slug: 'users', label: 'Адміністратори', desc: 'Користувачі CMS', icon: Shield, color: '#64748b' },
  ],
}

const quickActions = [
  { label: 'Новий товар', href: '/admin/collections/products/create', icon: Package },
  { label: 'Нова сторінка', href: '/admin/collections/pages/create', icon: FileText },
  { label: 'Новий банер', href: '/admin/collections/banners/create', icon: Layers },
]

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
      {/* Header */}
      <div className="hl-dash__header">
        <div>
          <h1 className="hl-dash__title">Панель управління</h1>
          <p className="hl-dash__subtitle">
            HAIR LAB — інтернет-магазин професійної косметики
          </p>
        </div>
        <div className="hl-dash__actions">
          {quickActions.map((action) => (
            <a key={action.href} href={action.href} className="hl-dash__action-btn">
              <Plus size={14} />
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="hl-dash__kpis">
        <KpiCard
          icon={Package}
          label="Активні товари"
          value={loading ? '—' : String(stats?.productsCount ?? 0)}
          color="#2a9d8f"
          href="/admin/collections/products"
          loading={loading}
        />
        <KpiCard
          icon={ShoppingBag}
          label="Замовлення"
          value={loading ? '—' : String(stats?.ordersCount ?? 0)}
          color="#3b82f6"
          href="/admin/collections/orders"
          loading={loading}
        />
        <KpiCard
          icon={TrendingUp}
          label="Дохід"
          value={loading ? '—' : formatPrice(stats?.revenue ?? 0)}
          color="#10b981"
          loading={loading}
        />
        <KpiCard
          icon={Users}
          label="Клієнти"
          value={loading ? '—' : String(stats?.customersCount ?? 0)}
          color="#8b5cf6"
          href="/admin/collections/customers"
          loading={loading}
        />
      </div>

      {/* Recent Orders */}
      {!loading && stats?.recentOrders && stats.recentOrders.length > 0 && (
        <div className="hl-dash__recent">
          <div className="hl-dash__section-header">
            <h2>Останні замовлення</h2>
            <a href="/admin/collections/orders" className="hl-dash__view-all">
              Всі замовлення <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="hl-dash__orders-table">
            <table>
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
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => { window.location.href = `/admin/collections/orders/${order.id}` }}
                    className="clickable"
                  >
                    <td className="hl-dash__order-id">#{order.displayId}</td>
                    <td>{order.email}</td>
                    <td className="hl-dash__order-total">{formatPrice(order.total)}</td>
                    <td>
                      <span className={`hl-dash__status hl-dash__status--${order.status}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <span className={`hl-dash__payment hl-dash__payment--${order.paymentStatus}`}>
                        {paymentLabels[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </td>
                    <td className="hl-dash__order-date">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <NavSection title="Магазин" items={sections.shop} />
      <NavSection title="Контент" items={sections.content} />
      <NavSection title="Каталог" items={sections.catalog} />
      <NavSection title="Система" items={sections.system} />
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
  href,
  loading,
}: {
  icon: React.FC<{ size?: number; className?: string }>
  label: string
  value: string
  color: string
  href?: string
  loading: boolean
}) {
  const content = (
    <>
      <div className="hl-dash__kpi-icon" style={{ backgroundColor: `${color}15`, color }}>
        {loading ? <Loader2 size={20} className="hl-dash__spin" /> : <Icon size={20} />}
      </div>
      <div className="hl-dash__kpi-data">
        <div className="hl-dash__kpi-value">{value}</div>
        <div className="hl-dash__kpi-label">{label}</div>
      </div>
    </>
  )

  if (href) {
    return (
      <a href={href} className="hl-dash__kpi hl-dash__kpi--link">
        {content}
      </a>
    )
  }

  return <div className="hl-dash__kpi">{content}</div>
}

function NavSection({
  title,
  items,
}: {
  title: string
  items: typeof sections.shop
}) {
  return (
    <div className="hl-dash__nav-section">
      <h3 className="hl-dash__nav-title">{title}</h3>
      <div className="hl-dash__nav-grid">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <a
              key={item.slug}
              href={`/admin/collections/${item.slug}`}
              className="hl-dash__nav-card"
            >
              <div
                className="hl-dash__nav-icon"
                style={{ backgroundColor: `${item.color}12`, color: item.color }}
              >
                <Icon size={18} />
              </div>
              <div className="hl-dash__nav-info">
                <span className="hl-dash__nav-label">{item.label}</span>
                <span className="hl-dash__nav-desc">{item.desc}</span>
              </div>
              <ArrowUpRight size={14} className="hl-dash__nav-arrow" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default Dashboard
