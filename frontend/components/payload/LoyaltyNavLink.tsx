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
      className={`nav__link${isActive ? ' active' : ''}`}
      prefetch={false}
    >
      <span className="hl-nav-icon" dangerouslySetInnerHTML={{ __html: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>' }} />
      <span className="nav__link-label">Лояльність</span>
    </Link>
  )
}

export default LoyaltyNavLink
