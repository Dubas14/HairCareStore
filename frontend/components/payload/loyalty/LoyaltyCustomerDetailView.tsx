'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  getLoyaltyCustomerDetail,
  toggleCustomerLoyalty,
  adjustCustomerPoints,
} from '@/app/actions/loyalty-admin'
import type { LoyaltySummary, Transaction, CustomerData } from './types'
import { transactionTypeLabels, transactionTypeColors, levelColors } from './types'
import LoyaltyLayout from './LoyaltyLayout'
import './loyalty-admin.scss'

const LoyaltyCustomerDetailView: React.FC = () => {
  const pathname = usePathname()
  const customerId = pathname?.split('/').pop() || ''

  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)

  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentDescription, setAdjustmentDescription] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [adjustError, setAdjustError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)

  const fetchData = useCallback(async () => {
    if (!customerId) return
    try {
      const data = await getLoyaltyCustomerDetail(customerId)
      setLoyalty(data.loyalty)
      setTransactions(data.transactions || [])
      setCustomer(data.customer)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggle = async () => {
    if (!loyalty) return
    setToggling(true)
    try {
      const data = await toggleCustomerLoyalty(customerId, !loyalty.isEnabled)
      setLoyalty(data.loyalty)
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  const handleAdjustment = async () => {
    const amount = parseInt(adjustmentAmount)
    if (!amount || isNaN(amount)) {
      setAdjustError('Введіть коректну кількість балів')
      return
    }

    setAdjusting(true)
    setAdjustError(null)

    try {
      await adjustCustomerPoints(customerId, amount, adjustmentDescription || undefined)
      await fetchData()
      setAdjustmentAmount('')
      setAdjustmentDescription('')
    } catch (err: any) {
      setAdjustError(err.message)
    } finally {
      setAdjusting(false)
    }
  }

  if (loading) {
    return (
      <LoyaltyLayout backHref="/admin/loyalty/customers" backLabel="Назад до списку">
        <div className="loyalty-admin"><div className="loyalty-admin__loading">Завантаження...</div></div>
      </LoyaltyLayout>
    )
  }

  if (!loyalty) {
    return (
      <LoyaltyLayout backHref="/admin/loyalty/customers" backLabel="Назад до списку">
        <div className="loyalty-admin"><div className="loyalty-admin__empty">Клієнта не знайдено</div></div>
      </LoyaltyLayout>
    )
  }

  return (
    <LoyaltyLayout backHref="/admin/loyalty/customers" backLabel="Назад до списку">
      <div className="loyalty-admin">
        <div className="loyalty-admin__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>
              {customer?.firstName || ''} {customer?.lastName || 'Клієнт'}
            </h1>
            <span
              className="loyalty-admin__type-badge"
              style={{
                backgroundColor: `${levelColors[loyalty.level]}20`,
                color: levelColors[loyalty.level],
                fontSize: 14,
                padding: '4px 12px',
              }}
            >
              {loyalty.level.charAt(0).toUpperCase() + loyalty.level.slice(1)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--color-base-400)' }}>
              {loyalty.isEnabled ? 'Бонуси увімкнено' : 'Бонуси вимкнено'}
            </span>
            <button
              type="button"
              className={`loyalty-admin__toggle loyalty-admin__toggle--${loyalty.isEnabled ? 'on' : 'off'}${toggling ? ' loyalty-admin__toggle--disabled' : ''}`}
              onClick={handleToggle}
              disabled={toggling}
            />
          </div>
        </div>
        <div style={{ color: 'var(--color-base-400)', fontSize: 13, marginBottom: 20 }}>
          {customer?.email || loyalty.customerId}
        </div>

        <div className="loyalty-admin__detail-grid">
          {/* Main content */}
          <div>
            {/* Balance Card */}
            <div className="loyalty-admin__form-section">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, textAlign: 'center' }}>
                <div>
                  <div style={{ color: 'var(--color-base-400)', fontSize: 13 }}>Баланс</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-base-800)' }}>{loyalty.pointsBalance.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-base-400)', fontSize: 13 }}>Зароблено</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: '#4a9468' }}>
                    +{loyalty.totalEarned.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-base-400)', fontSize: 13 }}>Витрачено</div>
                  <div style={{ fontSize: 22, fontWeight: 600, color: '#b06060' }}>
                    -{loyalty.totalSpent.toLocaleString()}
                  </div>
                </div>
              </div>

              {loyalty.nextLevel && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize' }}>{loyalty.level}</span>
                    <span style={{ textTransform: 'capitalize' }}>{loyalty.nextLevel}</span>
                  </div>
                  <div className="loyalty-admin__progress">
                    <div className="loyalty-admin__progress-fill" style={{ width: `${loyalty.progressPercent}%` }} />
                  </div>
                  <div style={{ color: 'var(--color-base-400)', fontSize: 12 }}>
                    {loyalty.pointsToNextLevel.toLocaleString()} балів до {loyalty.nextLevel}
                  </div>
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="loyalty-admin__table-wrapper">
              <div style={{ padding: 16, borderBottom: '1px solid var(--color-base-200)' }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--color-base-700)' }}>Історія транзакцій</h2>
              </div>
              <table className="loyalty-admin__table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Тип</th>
                    <th>Опис</th>
                    <th className="text-right">Бали</th>
                    <th className="text-right">Баланс</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="loyalty-admin__empty">Немає транзакцій</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                          {new Date(tx.createdAt).toLocaleDateString('uk-UA')}
                        </td>
                        <td>
                          <span
                            className="loyalty-admin__type-badge"
                            style={{
                              backgroundColor: `${transactionTypeColors[tx.transactionType] || '#6b7280'}20`,
                              color: transactionTypeColors[tx.transactionType] || '#6b7280',
                            }}
                          >
                            {transactionTypeLabels[tx.transactionType] || tx.transactionType}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--color-base-400)' }}>
                          {tx.description || '—'}
                        </td>
                        <td
                          className="text-right"
                          style={{ fontWeight: 500, color: tx.pointsAmount > 0 ? '#4a9468' : '#b06060' }}
                        >
                          {tx.pointsAmount > 0 ? '+' : ''}{tx.pointsAmount}
                        </td>
                        <td className="text-right">{tx.balanceAfter}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Info Card */}
            <div className="loyalty-admin__form-section">
              <h2>Інформація</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ color: 'var(--color-base-400)', fontSize: 13 }}>Реферальний код</div>
                  <code style={{ display: 'block', background: 'var(--color-base-100)', padding: '8px 12px', borderRadius: 6, marginTop: 4, fontSize: 14 }}>
                    {loyalty.referralCode}
                  </code>
                </div>
                {loyalty.referredBy && (
                  <div>
                    <div style={{ color: 'var(--color-base-400)', fontSize: 13 }}>Запрошений за кодом</div>
                    <div>{loyalty.referredBy}</div>
                  </div>
                )}
                <div>
                  <div style={{ color: 'var(--color-base-400)', fontSize: 13 }}>Множник рівня</div>
                  <div>x{loyalty.levelMultiplier}</div>
                </div>
              </div>
            </div>

            {/* Adjustment Form */}
            <div className="loyalty-admin__form-section">
              <h2>Коригування балів</h2>

              {adjustError && <div className="loyalty-admin__alert loyalty-admin__alert--error">{adjustError}</div>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="loyalty-admin__field">
                  <label>Кількість балів</label>
                  <input
                    type="number"
                    placeholder="100 або -50"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                  />
                  <div className="loyalty-admin__field-hint">
                    Додатне число для нарахування, від&apos;ємне для списання
                  </div>
                </div>
                <div className="loyalty-admin__field">
                  <label>Причина</label>
                  <textarea
                    placeholder="Причина коригування..."
                    value={adjustmentDescription}
                    onChange={(e) => setAdjustmentDescription(e.target.value)}
                    rows={2}
                  />
                </div>
                <button
                  className="loyalty-admin__btn loyalty-admin__btn--primary"
                  onClick={handleAdjustment}
                  disabled={adjusting}
                  style={{ width: '100%' }}
                >
                  {adjusting ? 'Застосування...' : 'Застосувати'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LoyaltyLayout>
  )
}

export default LoyaltyCustomerDetailView
