"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

interface HomePageAnimationsProps {
  children: React.ReactNode
}

export function HomePageAnimations({ children }: HomePageAnimationsProps) {
  const childrenArray = React.Children.toArray(children)

  // Hero slider doesn't need reveal animation - it's the first thing users see
  const [heroSlider, ...sections] = childrenArray

  // Різні варіанти анімацій для різноманітності
  const variants = [
    "fade-up",
    "fade-up",
    "zoom",
    "fade-up",
    "fade-left",
    "fade-up",
  ] as const

  return (
    <>
      {/* Hero slider - без анімації появи */}
      {heroSlider}

      {/* Інші секції з анімаціями */}
      {sections.map((section, index) => (
        <ScrollReveal
          key={index}
          variant={variants[index % variants.length]}
          delay={index === 0 ? 100 : 0}
          duration={700}
          threshold={0.15}
        >
          {section}
        </ScrollReveal>
      ))}
    </>
  )
}
