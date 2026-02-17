'use client'

import React from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import './site-pages.scss'

const SITE_PAGES_TABS = [
  { href: '/admin/site-pages', label: 'Про нас', exact: true },
  { href: '/admin/site-pages/delivery', label: 'Доставка та оплата', exact: false },
  { href: '/admin/site-pages/contacts', label: 'Контакти', exact: false },
]

interface SitePagesLayoutProps {
  children: React.ReactNode
}

const SitePagesLayout: React.FC<SitePagesLayoutProps> = ({ children }) => {
  const pathname = usePathname() || ''

  return (
    <div className="sp">
      <nav className="sp__nav">
        {SITE_PAGES_TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <NextLink
              key={item.href}
              href={item.href}
              className={`sp__nav-tab${isActive ? ' sp__nav-tab--active' : ''}`}
            >
              {item.label}
            </NextLink>
          )
        })}
      </nav>

      <div className="sp__content">
        {children}
      </div>
    </div>
  )
}

export default SitePagesLayout
