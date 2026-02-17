'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getLoyaltyCustomers, toggleCustomerLoyalty } from '@/app/actions/loyalty-admin'
import type { LoyaltyCustomer } from './types'
import { levelColors } from './types'
import LoyaltyLayout from './LoyaltyLayout'
import './loyalty-admin.scss'

const LoyaltyCustomersView: React.FC = () => {
  const router = useRouter()
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [count, setCount] = useState(0)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchCustomers = async (searchQuery?: string) => {
    setLoading(true)
    try {
      const data = await getLoyaltyCustomers({ search: searchQuery || undefined })
      setCustomers(data.customers || [])
      setCount(data.count || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleSearch = () => {
    fetchCustomers(search)
  }

  const handleToggle = async (customerId: string, currentValue: boolean, e: React.MouseEvent) => {
    e.stopPropagation()
    setToggling(customerId)
    try {
      await toggleCustomerLoyalty(customerId, !currentValue)
      setCustomers((prev) =>
        prev.map((c) =>
          c.customer_id === customerId ? { ...c, is_enabled: !currentValue } : c
        )
      )
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(null)
    }
  }

  return (
    <LoyaltyLayout>
      <div className="loyalty-admin">
        <div className="loyalty-admin__header">
          <h1>Клієнти програми лояльності</h1>
          <p>Перегляд та управління балансами клієнтів ({count} записів)</p>
        </div>

        <div className="loyalty-admin__search">
          <input
            placeholder="Пошук за email або реферальним кодом..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="loyalty-admin__table-wrapper">
          <table className="loyalty-admin__table">
            <thead>
              <tr>
                <th>Статус</th>
                <th>Клієнт</th>
                <th>Рівень</th>
                <th className="text-right">Баланс</th>
                <th className="text-right">Зароблено</th>
                <th className="text-right">Витрачено</th>
                <th>Реф. код</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="loyalty-admin__loading">Завантаження...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="loyalty-admin__empty">Клієнтів не знайдено</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="clickable"
                    onClick={() => router.push(`/admin/loyalty/customers/${customer.customer_id}`)}
                  >
                    <td>
                      <div onClick={(e) => handleToggle(customer.customer_id, customer.is_enabled, e)}>
                        <button
                          type="button"
                          className={`loyalty-admin__toggle loyalty-admin__toggle--${customer.is_enabled ? 'on' : 'off'}${toggling === customer.customer_id ? ' loyalty-admin__toggle--disabled' : ''}`}
                          disabled={toggling === customer.customer_id}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {customer.customer?.first_name || ''} {customer.customer?.last_name || ''}
                        {!customer.customer?.first_name && !customer.customer?.last_name && '—'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-base-400)' }}>
                        {customer.customer?.email || customer.customer_id}
                      </div>
                    </td>
                    <td>
                      <span
                        className="loyalty-admin__type-badge"
                        style={{
                          backgroundColor: `${levelColors[customer.level]}20`,
                          color: levelColors[customer.level],
                        }}
                      >
                        {customer.level.charAt(0).toUpperCase() + customer.level.slice(1)}
                      </span>
                    </td>
                    <td className="text-right" style={{ fontWeight: 500 }}>
                      {customer.points_balance.toLocaleString()}
                    </td>
                    <td className="text-right" style={{ color: '#4a9468' }}>
                      +{customer.total_earned.toLocaleString()}
                    </td>
                    <td className="text-right" style={{ color: '#b06060' }}>
                      -{customer.total_spent.toLocaleString()}
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: 'var(--color-base-100)', padding: '4px 8px', borderRadius: 4 }}>
                        {customer.referral_code}
                      </code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LoyaltyLayout>
  )
}

export default LoyaltyCustomersView
