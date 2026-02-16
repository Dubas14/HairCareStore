'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getLoyaltyStats } from '@/app/actions/loyalty-admin'
import type { LoyaltyStats } from './types'
import './loyalty-admin.scss'

const LoyaltyDashboardView: React.FC = () => {
  const [stats, setStats] = useState<LoyaltyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getLoyaltyStats()
      .then((data) => {
        setStats(data.stats)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="loyalty-admin"><div className="loyalty-admin__loading">Завантаження...</div></div>
  }

  if (error) {
    return (
      <div className="loyalty-admin">
        <div className="loyalty-admin__alert loyalty-admin__alert--error">Помилка: {error}</div>
      </div>
    )
  }

  return (
    <div className="loyalty-admin">
      <div className="loyalty-admin__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Програма лояльності</h1>
          <p>Управління бонусною програмою та балами клієнтів</p>
        </div>
        <span className={`loyalty-admin__badge loyalty-admin__badge--${stats?.isActive ? 'active' : 'inactive'}`}>
          {stats?.isActive ? 'Активна' : 'Неактивна'}
        </span>
      </div>

      <div className="loyalty-admin__stats">
        <div className="loyalty-admin__stat-card">
          <div className="loyalty-admin__stat-card-label">Всього клієнтів</div>
          <div className="loyalty-admin__stat-card-value">{stats?.totalCustomers || 0}</div>
        </div>
        <div className="loyalty-admin__stat-card">
          <div className="loyalty-admin__stat-card-label">Активні бали</div>
          <div className="loyalty-admin__stat-card-value">{stats?.totalPoints?.toLocaleString() || 0}</div>
        </div>
        <div className="loyalty-admin__stat-card">
          <div className="loyalty-admin__stat-card-label">Всього нараховано</div>
          <div className="loyalty-admin__stat-card-value loyalty-admin__stat-card-value--green">
            +{stats?.totalEarned?.toLocaleString() || 0}
          </div>
        </div>
        <div className="loyalty-admin__stat-card">
          <div className="loyalty-admin__stat-card-label">Всього витрачено</div>
          <div className="loyalty-admin__stat-card-value loyalty-admin__stat-card-value--red">
            -{stats?.totalSpent?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div className="loyalty-admin__levels">
        <h2>Розподіл за рівнями</h2>
        <div className="loyalty-admin__level-list">
          <div className="loyalty-admin__level-item">
            <div className="loyalty-admin__level-dot loyalty-admin__level-dot--bronze" />
            <div>
              <div style={{ fontWeight: 500 }}>Bronze</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-500, #9ca3af)' }}>
                {stats?.levelCounts?.bronze || 0} клієнтів
              </div>
            </div>
          </div>
          <div className="loyalty-admin__level-item">
            <div className="loyalty-admin__level-dot loyalty-admin__level-dot--silver" />
            <div>
              <div style={{ fontWeight: 500 }}>Silver</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-500, #9ca3af)' }}>
                {stats?.levelCounts?.silver || 0} клієнтів
              </div>
            </div>
          </div>
          <div className="loyalty-admin__level-item">
            <div className="loyalty-admin__level-dot loyalty-admin__level-dot--gold" />
            <div>
              <div style={{ fontWeight: 500 }}>Gold</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--theme-elevation-500, #9ca3af)' }}>
                {stats?.levelCounts?.gold || 0} клієнтів
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="loyalty-admin__links">
        <Link href="/admin/loyalty/settings" className="loyalty-admin__link-card">
          <h4>Налаштування</h4>
          <p>Конфігурація програми</p>
        </Link>
        <Link href="/admin/loyalty/customers" className="loyalty-admin__link-card">
          <h4>Клієнти</h4>
          <p>Перегляд балансів</p>
        </Link>
        <Link href="/admin/loyalty/transactions" className="loyalty-admin__link-card">
          <h4>Транзакції</h4>
          <p>Історія операцій</p>
        </Link>
      </div>
    </div>
  )
}

export default LoyaltyDashboardView
