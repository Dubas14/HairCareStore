'use client'

import React, { useEffect } from 'react'

/**
 * Provider that forces the Payload admin sidebar to stay open on desktop,
 * injects HAIR LAB branding, and adds SVG icons to navigation links.
 *
 * Payload v3 re-renders the entire <aside class="nav"> on client-side
 * navigation, so we observe the document body for structural changes
 * and re-apply our customizations whenever a new aside appears.
 */

/** Lucide-style SVG icons (18x18) mapped to collection slugs */
const NAV_ICONS: Record<string, string> = {
  media: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  users: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  banners: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>',
  pages: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  'promo-blocks': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  'blog-posts': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>',
  reviews: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  brands: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M14.31 8a4 4 0 0 0-5.78 1.14"/><path d="M9.69 16a4 4 0 0 0 5.78-1.14"/></svg>',
  categories: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  products: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  customers: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  orders: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
}

const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const DESKTOP_BREAKPOINT = 1024

    function isDesktop() {
      return window.innerWidth >= DESKTOP_BREAKPOINT
    }

    function forceNavOpen() {
      if (!isDesktop()) return
      const aside = document.querySelector('aside.nav')
      if (aside && aside.hasAttribute('inert')) {
        aside.removeAttribute('inert')
      }
    }

    /** Inject HAIR LAB logo into the sidebar header (idempotent) */
    function injectBranding() {
      const aside = document.querySelector('aside.nav')
      if (!aside) return
      if (aside.querySelector('.hl-sidebar-brand')) return

      const header = aside.querySelector('.nav__header')
      if (!header) return

      const brand = document.createElement('div')
      brand.className = 'hl-sidebar-brand'
      brand.innerHTML = `
        <a href="/admin" class="hl-sidebar-brand__link">
          <span class="hl-sidebar-brand__icon">HL</span>
          <span class="hl-sidebar-brand__text">
            <span class="hl-sidebar-brand__name">HAIR LAB</span>
            <span class="hl-sidebar-brand__sub">Панель управління</span>
          </span>
        </a>
      `

      const headerContent = header.querySelector('.nav__header-content')
      if (headerContent) {
        headerContent.insertBefore(brand, headerContent.firstChild)
      } else {
        header.insertBefore(brand, header.firstChild)
      }
    }

    /** Inject SVG icons into nav links (idempotent) */
    function injectIcons() {
      const aside = document.querySelector('aside.nav')
      if (!aside) return

      const links = aside.querySelectorAll<HTMLAnchorElement>('.nav__link')
      links.forEach((link) => {
        // Skip if already has an icon
        if (link.querySelector('.hl-nav-icon')) return

        const href = link.getAttribute('href') || ''
        const slugMatch = href.match(/\/admin\/collections\/([^/?#]+)/)
        if (!slugMatch) return

        const slug = slugMatch[1]
        const svgStr = NAV_ICONS[slug]
        if (!svgStr) return

        const iconWrapper = document.createElement('span')
        iconWrapper.className = 'hl-nav-icon'
        iconWrapper.innerHTML = svgStr
        link.insertBefore(iconWrapper, link.firstChild)
      })
    }

    function applyAll() {
      forceNavOpen()
      injectBranding()
      injectIcons()
    }

    // Initial setup
    applyAll()

    // Global observer on document.body — catches aside re-creation on navigation
    // as well as inert attribute changes on the aside
    const observer = new MutationObserver(() => {
      applyAll()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['inert'],
    })

    // Handle resize: if going from mobile to desktop, force open
    const handleResize = () => {
      if (isDesktop()) {
        forceNavOpen()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <>{children}</>
}

export default NavProvider
