'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SitePagesNavLink: React.FC = () => {
  const pathname = usePathname()
  const isActive = pathname?.startsWith('/admin/site-pages')

  return (
    <>
      <div className="hl-nav-group-label">Контент</div>
      <Link
        href="/admin/site-pages"
        className={`nav__link${isActive ? ' active' : ''}`}
        prefetch={false}
      >
        <span className="hl-nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </span>
        <span className="nav__link-label">Сторінки сайту</span>
      </Link>
    </>
  )
}

export default SitePagesNavLink
