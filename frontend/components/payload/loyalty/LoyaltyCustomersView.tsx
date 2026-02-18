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
        prev.map((c) => {
          const cId = typeof c.customer === 'object' && c.customer ? c.customer.id : c.customer
          return String(cId) === customerId ? { ...c, isEnabled: !currentValue } : c
        })
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
                customers.map((customer) => {
                  const customerId = typeof customer.customer === 'object' && customer.customer ? customer.customer.id : String(customer.customer)
                  const customerObj = typeof customer.customer === 'object' ? customer.customer : null
                  return (
                  <tr
                    key={customer.id}
                    className="clickable"
                    onClick={() => router.push(`/admin/loyalty/customers/${customerId}`)}
                  >
                    <td>
                      <div onClick={(e) => handleToggle(customerId, customer.isEnabled, e)}>
                        <button
                          type="button"
                          className={`loyalty-admin__toggle loyalty-admin__toggle--${customer.isEnabled ? 'on' : 'off'}${toggling === customerId ? ' loyalty-admin__toggle--disabled' : ''}`}
                          disabled={toggling === customerId}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {customerObj?.firstName || ''} {customerObj?.lastName || ''}
                        {!customerObj?.firstName && !customerObj?.lastName && '—'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-base-400)' }}>
                        {customerObj?.email || customerId}
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
                      {customer.pointsBalance.toLocaleString()}
                    </td>
                    <td className="text-right" style={{ color: '#4a9468' }}>
                      +{customer.totalEarned.toLocaleString()}
                    </td>
                    <td className="text-right" style={{ color: '#b06060' }}>
                      -{customer.totalSpent.toLocaleString()}
                    </td>
                    <td>
                      <code style={{ fontSize: 12, background: 'var(--color-base-100)', padding: '4px 8px', borderRadius: 4 }}>
                        {customer.referralCode}
                      </code>
                    </td>
                  </tr>
                  )
                }))
              }
            </tbody>
          </table>
        </div>
      </div>
    </LoyaltyLayout>
  )
}

export default LoyaltyCustomersView
