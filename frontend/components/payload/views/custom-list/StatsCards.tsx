'use client'

import React from 'react'

export interface StatItem {
  label: string
  value: number | string
  icon: React.ReactNode
  color: 'sea' | 'success' | 'warning' | 'muted'
}

export const StatsCards: React.FC<{ stats: StatItem[] }> = ({ stats }) => (
  <div className="hl-stats-cards">
    {stats.map((s, i) => (
      <div key={i} className="hl-stats-card">
        <div className={`hl-stats-card__icon hl-stats-card__icon--${s.color}`}>
          {s.icon}
        </div>
        <div>
          <div className="hl-stats-card__value">
            {typeof s.value === 'number' ? s.value.toLocaleString('uk-UA') : s.value}
          </div>
          <div className="hl-stats-card__label">{s.label}</div>
        </div>
      </div>
    ))}
  </div>
)
