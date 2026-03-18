"use client"

import * as React from "react"
import { useScrollVelocityBlur } from "@/lib/hooks/use-scroll-velocity-blur"

interface HomePageAnimationsProps {
  children: React.ReactNode
}

export function HomePageAnimations({ children }: HomePageAnimationsProps) {
  const containerRef = useScrollVelocityBlur(2.5)

  return <div ref={containerRef}>{children}</div>
}
