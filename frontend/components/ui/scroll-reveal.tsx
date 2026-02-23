"use client"

import * as React from "react"
import { useInView } from "react-intersection-observer"
import { cn } from "@/lib/utils"

type RevealVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "fade" | "zoom" | "slide-up"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  variant?: RevealVariant
  delay?: number
  duration?: number
  threshold?: number
  triggerOnce?: boolean
  as?: React.ElementType
}

// Transforms only — no opacity hide. Content is always readable (SEO, a11y).
const variantClasses: Record<RevealVariant, { initial: string; animate: string }> = {
  "fade-up": {
    initial: "opacity-0 translate-y-8",
    animate: "opacity-100 translate-y-0",
  },
  "fade-down": {
    initial: "opacity-0 -translate-y-8",
    animate: "opacity-100 translate-y-0",
  },
  "fade-left": {
    initial: "opacity-0 translate-x-8",
    animate: "opacity-100 translate-x-0",
  },
  "fade-right": {
    initial: "opacity-0 -translate-x-8",
    animate: "opacity-100 translate-x-0",
  },
  "fade": {
    initial: "opacity-0",
    animate: "opacity-100",
  },
  "zoom": {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
  },
  "slide-up": {
    initial: "opacity-0 translate-y-12",
    animate: "opacity-100 translate-y-0",
  },
}

export function ScrollReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
  as: Component = "div",
}: ScrollRevealProps) {
  const [ready, setReady] = React.useState(false)
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  })

  // Only apply hidden state after client hydration + observer setup
  React.useEffect(() => {
    // Small delay lets IntersectionObserver fire for already-visible elements
    // Delay lets IntersectionObserver fire first for above-fold elements
    const id = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(id)
  }, [])

  const variants = variantClasses[variant]

  // Before ready: always show content (SSR & first paint).
  // After ready: use IntersectionObserver result.
  const isVisible = !ready || inView

  return (
    <Component
      ref={ref}
      className={cn(
        "transition-all will-change-transform",
        isVisible ? variants.animate : variants.initial,
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      }}
    >
      {children}
    </Component>
  )
}

// Stagger container for animating children with delay
interface ScrollRevealGroupProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  variant?: RevealVariant
  duration?: number
  threshold?: number
  triggerOnce?: boolean
}

export function ScrollRevealGroup({
  children,
  className,
  staggerDelay = 100,
  variant = "fade-up",
  duration = 600,
  threshold = 0.1,
  triggerOnce = true,
}: ScrollRevealGroupProps) {
  const [ready, setReady] = React.useState(false)
  const { ref, inView } = useInView({
    threshold,
    triggerOnce,
  })

  React.useEffect(() => {
    // Delay lets IntersectionObserver fire first for above-fold elements
    const id = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(id)
  }, [])

  const variants = variantClasses[variant]
  const isVisible = !ready || inView

  return (
    <div ref={ref} className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child

        return (
          <div
            className={cn(
              "transition-all will-change-transform",
              isVisible ? variants.animate : variants.initial
            )}
            style={{
              transitionDuration: `${duration}ms`,
              transitionDelay: `${index * staggerDelay}ms`,
              transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {child}
          </div>
        )
      })}
    </div>
  )
}

// Section wrapper with reveal animation
interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  variant?: RevealVariant
  delay?: number
}

export function RevealSection({
  children,
  className,
  variant = "fade-up",
  delay = 0,
}: RevealSectionProps) {
  return (
    <ScrollReveal
      as="section"
      variant={variant}
      delay={delay}
      className={className}
    >
      {children}
    </ScrollReveal>
  )
}

export default ScrollReveal
