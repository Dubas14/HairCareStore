'use client'

import React from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import './loyalty-admin.scss'

const LOYALTY_TABS = [
  { href: '/admin/loyalty', label: 'Дашборд', exact: true },
  { href: '/admin/loyalty/customers', label: 'Клієнти', exact: false },
  { href: '/admin/loyalty/transactions', label: 'Транзакції', exact: false },
  { href: '/admin/loyalty/settings', label: 'Налаштування', exact: true },
]

interface LoyaltyLayoutProps {
  children: React.ReactNode
  backHref?: string
  backLabel?: string
}

const LoyaltyLayout: React.FC<LoyaltyLayoutProps> = ({ children, backHref, backLabel }) => {
  const pathname = usePathname() || ''

  return (
    <div className="hl-loyalty">
      {backHref && (
        <NextLink href={backHref} className="hl-loyalty__back">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          {backLabel || 'Назад'}
        </NextLink>
      )}

      <nav className="hl-loyalty__nav">
        {LOYALTY_TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`hl-loyalty__nav-tab${isActive ? ' hl-loyalty__nav-tab--active' : ''}`}
            >
              {item.label}
            </NextLink>
          )
        })}
      </nav>

      <div className="hl-loyalty__content">
        {children}
      </div>
    </div>
  )
}

export default LoyaltyLayout
