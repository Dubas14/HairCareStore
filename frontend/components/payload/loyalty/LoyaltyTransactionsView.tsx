'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLoyaltyTransactions } from '@/app/actions/loyalty-admin'
import type { Transaction } from './types'
import { transactionTypeLabels, transactionTypeColors } from './types'
import LoyaltyLayout from './LoyaltyLayout'
import './loyalty-admin.scss'

const LoyaltyTransactionsView: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const fetchTransactions = async (newOffset = 0) => {
    setLoading(true)
    try {
      const data = await getLoyaltyTransactions({ limit, offset: newOffset })
      setTransactions(data.transactions || [])
      setCount(data.count || 0)
      setOffset(newOffset)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const totalPages = Math.ceil(count / limit)
  const currentPage = Math.floor(offset / limit) + 1

  return (
    <LoyaltyLayout>
      <div className="loyalty-admin">
        <div className="loyalty-admin__header">
          <h1>Історія транзакцій</h1>
          <p>Всі операції з балами ({count} записів)</p>
        </div>

        <div className="loyalty-admin__table-wrapper">
          <table className="loyalty-admin__table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Клієнт</th>
                <th>Тип</th>
                <th>Опис</th>
                <th className="text-right">Бали</th>
                <th className="text-right">Баланс після</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="loyalty-admin__loading">Завантаження...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="loyalty-admin__empty">Транзакцій не знайдено</td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const customerId = typeof tx.customer === 'object' && tx.customer ? tx.customer.id : String(tx.customer)
                  const customerObj = typeof tx.customer === 'object' ? tx.customer : null
                  return (
                  <tr key={tx.id}>
                    <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                      {new Date(tx.createdAt).toLocaleDateString('uk-UA')}{' '}
                      <span style={{ color: 'var(--color-base-400)' }}>
                        {new Date(tx.createdAt).toLocaleTimeString('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/loyalty/customers/${customerId}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ fontWeight: 500 }}>
                          {customerObj?.firstName || ''} {customerObj?.lastName || ''}
                          {!customerObj?.firstName && !customerObj?.lastName && '—'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-base-400)' }}>
                          {customerObj?.email || customerId}
                        </div>
                      </Link>
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
                    <td style={{ fontSize: 13, color: 'var(--color-base-400)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description || '—'}
                      </div>
                      {tx.orderId && (
                        <div style={{ fontSize: 12 }}>
                          Замовлення: {String(tx.orderId).slice(0, 12)}...
                        </div>
                      )}
                    </td>
                    <td
                      className="text-right"
                      style={{ fontWeight: 500, color: tx.pointsAmount > 0 ? '#4a9468' : '#b06060' }}
                    >
                      {tx.pointsAmount > 0 ? '+' : ''}{tx.pointsAmount.toLocaleString()}
                    </td>
                    <td className="text-right">{tx.balanceAfter.toLocaleString()}</td>
                  </tr>
                  )
                }))
              }
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="loyalty-admin__pagination">
              <span className="loyalty-admin__pagination-info">
                Сторінка {currentPage} з {totalPages}
              </span>
              <div className="loyalty-admin__pagination-buttons">
                <button
                  className="loyalty-admin__btn loyalty-admin__btn--secondary"
                  onClick={() => fetchTransactions(Math.max(0, offset - limit))}
                  disabled={offset === 0}
                >
                  Попередня
                </button>
                <button
                  className="loyalty-admin__btn loyalty-admin__btn--secondary"
                  onClick={() => fetchTransactions(offset + limit)}
                  disabled={offset + limit >= count}
                >
                  Наступна
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </LoyaltyLayout>
  )
}

export default LoyaltyTransactionsView
