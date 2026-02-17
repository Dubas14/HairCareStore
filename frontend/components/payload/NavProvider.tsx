'use client'

import React, { useEffect } from 'react'

/**
 * Provider that forces the Payload admin sidebar to stay open on desktop
 * and injects HAIR LAB branding into the sidebar header.
 *
 * Payload v3 re-renders the entire <aside class="nav"> on client-side
 * navigation, so we observe the document body for structural changes
 * and re-apply our customizations whenever a new aside appears.
 */
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

    function applyAll() {
      forceNavOpen()
      injectBranding()
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
