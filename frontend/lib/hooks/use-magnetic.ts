'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'

/**
 * Makes an element follow the cursor within a small radius.
 * Attach the returned ref to any element (button, link, etc.).
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return

    let raf: number

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) * strength
      const dy = (e.clientY - cy) * strength

      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate(${dx}px, ${dy}px)`
        el.style.transition = 'transform 0.25s cubic-bezier(0.33, 1, 0.68, 1)'
      })
    }

    const handleLeave = () => {
      cancelAnimationFrame(raf)
      el.style.transform = ''
      el.style.transition = 'transform 0.45s cubic-bezier(0.33, 1, 0.68, 1)'
    }

    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [strength])

  return ref
}
