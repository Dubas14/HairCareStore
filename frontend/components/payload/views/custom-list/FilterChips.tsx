'use client'

import React from 'react'

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export const FilterChips: React.FC<{
  options: FilterOption[]
  activeValue: string
  onChange: (value: string) => void
}> = ({ options, activeValue, onChange }) => (
  <div className="hl-filter-chips">
    {options.map((opt) => (
      <button
        key={opt.value}
        className={`hl-filter-chip${opt.value === activeValue ? ' hl-filter-chip--active' : ''}`}
        onClick={() => onChange(opt.value)}
      >
        {opt.label}
        {opt.count !== undefined && (
          <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7, fontWeight: 600 }}>
            {opt.count}
          </span>
        )}
      </button>
    ))}
  </div>
)
