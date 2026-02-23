'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_HEX,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_HEX,
  FULFILLMENT_STATUS_LABELS,
  FULFILLMENT_STATUS_HEX,
} from '@/lib/payload/types'
import { generatePackingSlip } from '@/lib/pdf/packing-slip'

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItem {
  productTitle: string
  variantTitle?: string
  quantity: number
  unitPrice: number
  subtotal: number
  productId?: number
  thumbnail?: string
  id?: string
}

interface ShippingAddress {
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  address1?: string
  countryCode?: string
  postalCode?: string
}

interface OrderData {
  id?: string | number
  displayId?: number
  customer?: any
  email?: string
  status?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  items?: OrderItem[]
  shippingAddress?: ShippingAddress
  paymentMethod?: string
  shippingMethod?: string
  subtotal?: number
  shippingTotal?: number
  total?: number
  createdAt?: string
  updatedAt?: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
  color: ORDER_STATUS_HEX[value] || '#9ba5ab',
}))

const PAYMENT_OPTIONS = Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
  color: PAYMENT_STATUS_HEX[value] || '#9ba5ab',
}))

const FULFILLMENT_OPTIONS = Object.entries(FULFILLMENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
  color: FULFILLMENT_STATUS_HEX[value] || '#9ba5ab',
}))

const PAYMENT_METHODS: Record<string, string> = {
  cod: 'Накладний платіж',
  card: 'Картка',
  online: 'Онлайн оплата',
}

const UK_MONTHS = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h}:${m}`
}

function formatPrice(n?: number): string {
  if (n == null) return '0 ₴'
  return `${n.toLocaleString('uk-UA')} ₴`
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function IconArrowLeft() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function IconSave() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconTruck() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconPrint() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

// ─── Status Badge Component ──────────────────────────────────────────────────

function StatusBadge({ value, options }: { value?: string; options: typeof STATUS_OPTIONS }) {
  const opt = options.find((o) => o.value === value)
  if (!opt) return <span style={{ color: 'var(--color-base-400)' }}>—</span>
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: `${opt.color}18`,
        color: opt.color,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: opt.color }} />
      {opt.label}
    </span>
  )
}

// ─── Status Select Component ─────────────────────────────────────────────────

function StatusSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value?: string
  onChange: (v: string) => void
  options: typeof STATUS_OPTIONS
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-base-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </div>
      <select
        className="hl-field__select"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontSize: 13 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function OrderSkeleton() {
  return (
    <div className="hl-edit-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28 }}>
        <span className="hl-skeleton" style={{ width: 260, height: 28 }} />
        <span className="hl-skeleton" style={{ width: 120, height: 38 }} />
      </div>
      <div className="hl-edit-layout">
        <div>
          <div className="hl-field-group">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <span className="hl-skeleton" style={{ width: '100%', height: 60 }} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <span className="hl-skeleton" style={{ width: '100%', height: 280 }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OrderEditView() {
  const router = useRouter()
  const [docId, setDocId] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [form, setForm] = useState<OrderData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const isCreate = docId === 'create'

  // Extract docId from URL
  useEffect(() => {
    const path = window.location.pathname
    const match = path.match(/\/admin\/collections\/orders\/([^/]+)/)
    if (match) setDocId(match[1])
  }, [])

  // Fetch order
  const fetchOrder = useCallback(async () => {
    if (!docId) return
    setIsLoading(true)
    try {
      if (docId === 'create') {
        setOrder({})
        setForm({
          status: 'pending',
          paymentStatus: 'awaiting',
          fulfillmentStatus: 'not_fulfilled',
          items: [],
          shippingAddress: {},
          subtotal: 0,
          shippingTotal: 0,
          total: 0,
          paymentMethod: 'cod',
          shippingMethod: '',
          email: '',
        })
      } else {
        const res = await fetch(`/api/orders/${docId}?depth=1`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
          setForm({ ...data })
        }
      }
    } catch (err) {
      console.error('Error loading order:', err)
    } finally {
      setIsLoading(false)
    }
  }, [docId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  // Toast
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Field update helper
  const updateField = <K extends keyof OrderData>(key: K, value: OrderData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Address update helper
  const updateAddress = (key: keyof ShippingAddress, value: string) => {
    setForm((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, [key]: value },
    }))
  }

  // Items helpers
  const updateItem = (index: number, key: keyof OrderItem, value: any) => {
    setForm((prev) => {
      const items = [...(prev.items || [])]
      items[index] = { ...items[index], [key]: value }
      // Recalc subtotal for item
      if (key === 'quantity' || key === 'unitPrice') {
        const qty = key === 'quantity' ? Number(value) : items[index].quantity
        const price = key === 'unitPrice' ? Number(value) : items[index].unitPrice
        items[index].subtotal = qty * price
      }
      // Recalc order totals
      const subtotal = items.reduce((s, it) => s + (it.subtotal || 0), 0)
      return { ...prev, items, subtotal, total: subtotal + (prev.shippingTotal || 0) }
    })
  }

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...(prev.items || []), { productTitle: '', quantity: 1, unitPrice: 0, subtotal: 0 }],
    }))
  }

  const removeItem = (index: number) => {
    setForm((prev) => {
      const items = (prev.items || []).filter((_, i) => i !== index)
      const subtotal = items.reduce((s, it) => s + (it.subtotal || 0), 0)
      return { ...prev, items, subtotal, total: subtotal + (prev.shippingTotal || 0) }
    })
  }

  // Save
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = isCreate ? '/api/orders' : `/api/orders/${docId}`
      const method = isCreate ? 'POST' : 'PATCH'

      // Build payload — only send editable fields
      const body: any = {
        email: form.email,
        status: form.status,
        paymentStatus: form.paymentStatus,
        fulfillmentStatus: form.fulfillmentStatus,
        items: form.items,
        shippingAddress: form.shippingAddress,
        paymentMethod: form.paymentMethod,
        shippingMethod: form.shippingMethod,
        subtotal: form.subtotal,
        shippingTotal: form.shippingTotal,
        total: form.total,
      }

      // Include customer if set
      if (form.customer) {
        body.customer = typeof form.customer === 'object' ? form.customer.id : form.customer
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showToast(isCreate ? 'Замовлення створено' : 'Замовлення збережено')
        setTimeout(() => {
          router.push('/admin/collections/orders')
        }, 600)
      } else {
        const err = await res.json().catch(() => null)
        showToast(err?.errors?.[0]?.message || 'Помилка збереження', 'error')
      }
    } catch {
      showToast('Помилка збереження', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete
  const handleDelete = async () => {
    if (!window.confirm('Видалити це замовлення?')) return
    try {
      const res = await fetch(`/api/orders/${docId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/collections/orders')
      } else {
        showToast('Помилка видалення', 'error')
      }
    } catch {
      showToast('Помилка видалення', 'error')
    }
  }

  if (isLoading) return <OrderSkeleton />

  if (!order && !isCreate) {
    return (
      <div className="hl-edit-view">
        <div className="hl-empty-state">
          <div className="hl-empty-state__title">Замовлення не знайдено</div>
          <button className="hl-btn hl-btn--secondary" onClick={() => router.push('/admin/collections/orders')}>
            Повернутись до списку
          </button>
        </div>
      </div>
    )
  }

  const customerName = form.customer && typeof form.customer === 'object'
    ? `${form.customer.firstName || ''} ${form.customer.lastName || ''}`.trim() || form.customer.email
    : null

  return (
    <div className="hl-edit-view" style={{ maxWidth: 1300 }}>
      {/* ── Header ── */}
      <div className="hl-edit-header">
        <div>
          <button className="hl-edit-header__back" onClick={() => router.push('/admin/collections/orders')}>
            <IconArrowLeft /> Замовлення
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div className="hl-edit-header__title">
              {isCreate ? 'Нове замовлення' : `Замовлення #${form.displayId || docId}`}
            </div>
            {!isCreate && <StatusBadge value={form.status} options={STATUS_OPTIONS} />}
          </div>
        </div>
        <div className="hl-edit-header__actions">
          {!isCreate && (
            <button className="hl-btn hl-btn--danger hl-btn--sm" onClick={handleDelete}>
              <IconTrash /> Видалити
            </button>
          )}
          {!isCreate && (
            <button
              className="hl-btn hl-btn--secondary hl-btn--sm"
              onClick={() => {
                generatePackingSlip(form).catch((err) => {
                  console.error('PDF generation error:', err)
                  showToast('Помилка генерації PDF', 'error')
                })
              }}
            >
              <IconPrint /> Накладна PDF
            </button>
          )}
          <button className="hl-btn hl-btn--primary" onClick={handleSave} disabled={isSaving}>
            <IconSave /> {isSaving ? 'Збереження...' : 'Зберегти'}
          </button>
        </div>
      </div>

      {/* ── Layout: Main + Sidebar ── */}
      <div className="hl-edit-layout" style={{ gridTemplateColumns: '1fr 320px' }}>
        {/* ── Main column ── */}
        <div>
          {/* Items section */}
          <div className="hl-field-group">
            <div className="hl-field-group__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconPackage /> Товари
            </div>

            {(form.items || []).length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="hl-order-table">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Товар</th>
                      <th style={{ width: '15%' }}>Варіант</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>Кількість</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Ціна</th>
                      <th style={{ width: '15%', textAlign: 'right' }}>Сума</th>
                      <th style={{ width: '8%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(form.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            className="hl-order-table__input"
                            value={item.productTitle || ''}
                            onChange={(e) => updateItem(idx, 'productTitle', e.target.value)}
                            placeholder="Назва товару"
                          />
                        </td>
                        <td>
                          <input
                            className="hl-order-table__input"
                            value={item.variantTitle || ''}
                            onChange={(e) => updateItem(idx, 'variantTitle', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                        <td>
                          <input
                            className="hl-order-table__input"
                            type="number"
                            min={1}
                            value={item.quantity || 1}
                            onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value) || 1)}
                            style={{ textAlign: 'center' }}
                          />
                        </td>
                        <td>
                          <input
                            className="hl-order-table__input"
                            type="number"
                            min={0}
                            value={item.unitPrice || 0}
                            onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value) || 0)}
                            style={{ textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-base-700)', fontSize: 13 }}>
                          {formatPrice(item.subtotal)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="hl-order-table__remove"
                            onClick={() => removeItem(idx)}
                            title="Видалити рядок"
                          >
                            <IconTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-base-400)', fontSize: 13 }}>
                Немає товарів
              </div>
            )}

            <button className="hl-btn hl-btn--secondary hl-btn--sm" onClick={addItem} style={{ marginTop: 12 }}>
              <IconPlus /> Додати товар
            </button>

            {/* Totals row */}
            <div className="hl-order-totals">
              <div className="hl-order-totals__row">
                <span>Підсумок товарів</span>
                <span>{formatPrice(form.subtotal)}</span>
              </div>
              <div className="hl-order-totals__row">
                <span>Доставка</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    className="hl-order-table__input"
                    type="number"
                    min={0}
                    value={form.shippingTotal || 0}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0
                      setForm((prev) => ({
                        ...prev,
                        shippingTotal: v,
                        total: (prev.subtotal || 0) + v,
                      }))
                    }}
                    style={{ width: 100, textAlign: 'right' }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--color-base-400)' }}>₴</span>
                </div>
              </div>
              <div className="hl-order-totals__row hl-order-totals__row--total">
                <span>Загальна сума</span>
                <span>{formatPrice(form.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="hl-field-group">
            <div className="hl-field-group__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconTruck /> Адреса доставки
            </div>
            <div className="hl-field-group__row">
              <div className="hl-field">
                <label className="hl-field__label">Ім'я</label>
                <input
                  className="hl-field__input"
                  value={form.shippingAddress?.firstName || ''}
                  onChange={(e) => updateAddress('firstName', e.target.value)}
                />
              </div>
              <div className="hl-field">
                <label className="hl-field__label">Прізвище</label>
                <input
                  className="hl-field__input"
                  value={form.shippingAddress?.lastName || ''}
                  onChange={(e) => updateAddress('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="hl-field-group__row">
              <div className="hl-field">
                <label className="hl-field__label">Телефон</label>
                <input
                  className="hl-field__input"
                  value={form.shippingAddress?.phone || ''}
                  onChange={(e) => updateAddress('phone', e.target.value)}
                />
              </div>
              <div className="hl-field">
                <label className="hl-field__label">Місто</label>
                <input
                  className="hl-field__input"
                  value={form.shippingAddress?.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                />
              </div>
            </div>
            <div className="hl-field">
              <label className="hl-field__label">Відділення НП</label>
              <input
                className="hl-field__input"
                value={form.shippingAddress?.address1 || ''}
                onChange={(e) => updateAddress('address1', e.target.value)}
              />
            </div>
          </div>

          {/* Customer + payment info */}
          <div className="hl-field-group">
            <div className="hl-field-group__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconUser /> Контактна інформація
            </div>
            <div className="hl-field-group__row">
              <div className="hl-field">
                <label className="hl-field__label">Email</label>
                <input
                  className="hl-field__input"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="hl-field">
                <label className="hl-field__label">Спосіб оплати</label>
                <input
                  className="hl-field__input"
                  value={form.paymentMethod || ''}
                  onChange={(e) => updateField('paymentMethod', e.target.value)}
                />
                {form.paymentMethod && PAYMENT_METHODS[form.paymentMethod] && (
                  <div style={{ fontSize: 11, color: 'var(--color-base-400)', marginTop: 4 }}>
                    {PAYMENT_METHODS[form.paymentMethod]}
                  </div>
                )}
              </div>
            </div>
            <div className="hl-field-group__row">
              <div className="hl-field">
                <label className="hl-field__label">Спосіб доставки</label>
                <input
                  className="hl-field__input"
                  value={form.shippingMethod || ''}
                  onChange={(e) => updateField('shippingMethod', e.target.value)}
                />
              </div>
              <div className="hl-field">
                <label className="hl-field__label">Клієнт</label>
                <input
                  className="hl-field__input"
                  value={customerName || (form.customer ? `ID: ${typeof form.customer === 'object' ? form.customer.id : form.customer}` : '—')}
                  disabled
                  style={{ background: 'var(--color-base-50)', color: 'var(--color-base-400)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <div className="hl-sidebar-meta">
            <div className="hl-sidebar-meta__title">Управління</div>

            <StatusSelect
              label="Статус замовлення"
              value={form.status}
              onChange={(v) => updateField('status', v)}
              options={STATUS_OPTIONS}
            />
            <StatusSelect
              label="Статус оплати"
              value={form.paymentStatus}
              onChange={(v) => updateField('paymentStatus', v)}
              options={PAYMENT_OPTIONS}
            />
            <StatusSelect
              label="Статус доставки"
              value={form.fulfillmentStatus}
              onChange={(v) => updateField('fulfillmentStatus', v)}
              options={FULFILLMENT_OPTIONS}
            />

            {!isCreate && (
              <>
                <div style={{ borderTop: '1px solid var(--color-base-100)', margin: '16px 0', paddingTop: 12 }}>
                  <div className="hl-sidebar-meta__row">
                    <span className="hl-sidebar-meta__key">ID</span>
                    <span className="hl-sidebar-meta__value" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {order?.id}
                    </span>
                  </div>
                  <div className="hl-sidebar-meta__row">
                    <span className="hl-sidebar-meta__key">Створено</span>
                    <span className="hl-sidebar-meta__value">{formatDate(order?.createdAt)}</span>
                  </div>
                  <div className="hl-sidebar-meta__row">
                    <span className="hl-sidebar-meta__key">Оновлено</span>
                    <span className="hl-sidebar-meta__value">{formatDate(order?.updatedAt)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick summary card */}
          {!isCreate && (
            <div className="hl-field-group" style={{ marginTop: 16, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-base-400)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Підсумок
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--color-base-500)' }}>Товарів</span>
                <span style={{ fontWeight: 500, color: 'var(--color-base-700)' }}>{(form.items || []).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                <span style={{ color: 'var(--color-base-500)' }}>Загальна кількість</span>
                <span style={{ fontWeight: 500, color: 'var(--color-base-700)' }}>
                  {(form.items || []).reduce((s, it) => s + (it.quantity || 0), 0)} шт.
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: 'var(--color-sea-600)', paddingTop: 8, borderTop: '1px solid var(--color-base-100)' }}>
                <span>Сума</span>
                <span>{formatPrice(form.total)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`hl-toast hl-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  )
}
