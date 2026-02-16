'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LoyaltyNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/loyalty')

  return (
    <Link
      href="/admin/loyalty"
      className={`nav__link ${isActive ? 'nav__link--active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        textDecoration: 'none',
        color: isActive ? 'var(--theme-text, #fff)' : 'var(--theme-elevation-500, #9ca3af)',
        backgroundColor: isActive ? 'var(--theme-elevation-100, rgba(255,255,255,0.05))' : 'transparent',
        transition: 'all 0.15s ease',
        fontSize: '0.875rem',
        fontWeight: isActive ? 500 : 400,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
      </svg>
      Лояльність
    </Link>
  )
}

export default LoyaltyNavLink
