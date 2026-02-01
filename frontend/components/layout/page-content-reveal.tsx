"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

interface PageContentRevealProps {
  children: React.ReactNode
  className?: string
}

export function PageContentReveal({ children, className }: PageContentRevealProps) {
  return (
    <ScrollReveal variant="fade-up" duration={600} className={className}>
      {children}
    </ScrollReveal>
  )
}

interface PageHeaderRevealProps {
  children: React.ReactNode
  className?: string
}

export function PageHeaderReveal({ children, className }: PageHeaderRevealProps) {
  return (
    <ScrollReveal variant="fade-down" duration={500} className={className}>
      {children}
    </ScrollReveal>
  )
}
