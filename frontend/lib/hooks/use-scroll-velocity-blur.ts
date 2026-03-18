'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '@/lib/gsap'

/**
 * Applies a subtle motion blur to target elements based on scroll speed.
 * Elements must have `data-velocity-blur` attribute.
 * The blur fades in during fast scrolling and out when scrolling stops.
 */
export function useScrollVelocityBlur(maxBlur = 3) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion()) return

    let lastY = window.scrollY
    let lastTime = performance.now()
    let currentBlur = 0
    let raf: number

    const elements = containerRef.current.querySelectorAll<HTMLElement>('[data-velocity-blur]')
    if (elements.length === 0) return

    const tick = () => {
      const now = performance.now()
      const dt = now - lastTime
      const dy = Math.abs(window.scrollY - lastY)

      if (dt > 0) {
        const speed = (dy / dt) * 16 // normalize to ~per frame
        const targetBlur = Math.min(speed * 0.6, maxBlur)

        // Lerp towards target
        currentBlur += (targetBlur - currentBlur) * 0.3

        if (currentBlur < 0.05) currentBlur = 0

        const val = `blur(${currentBlur.toFixed(1)}px)`
        for (let i = 0; i < elements.length; i++) {
          elements[i].style.filter = currentBlur > 0.05 ? val : ''
        }
      }

      lastY = window.scrollY
      lastTime = now
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      for (let i = 0; i < elements.length; i++) {
        elements[i].style.filter = ''
      }
    }
  }, [maxBlur])

  return containerRef
}
