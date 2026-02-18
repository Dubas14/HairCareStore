'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const groupLabelStyle: React.CSSProperties = {
  color: 'var(--color-base-400)',
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.11em',
  padding: '14px 20px 6px',
}

const ShippingNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/shipping')

  return (
    <>
      <div style={groupLabelStyle}>Конфігурація</div>
      <Link
        href="/admin/shipping"
        className={`nav__link${isActive ? ' active' : ''}`}
        prefetch={false}
      >
        <span className="hl-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </span>
        <span className="nav__link-label">Доставка</span>
      </Link>
    </>
  )
}

export default ShippingNavLink
