"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ShimmerBadgeProps {
  children: React.ReactNode
  variant?: "sale" | "new" | "bestseller" | "limited"
  size?: "sm" | "md"
  className?: string
}

const variantStyles = {
  sale: {
    bg: "bg-gradient-to-r from-[#BC4749] to-[#D4A373]",
    text: "text-white",
    shimmer: "via-white/30",
  },
  new: {
    bg: "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4]",
    text: "text-white",
    shimmer: "via-white/30",
  },
  bestseller: {
    bg: "bg-gradient-to-r from-[#D4A373] to-[#E9C46A]",
    text: "text-[#1A1A1A]",
    shimmer: "via-white/40",
  },
  limited: {
    bg: "bg-gradient-to-r from-[#9FA0C3] to-[#B8B8D1]",
    text: "text-white",
    shimmer: "via-white/30",
  },
}

const sizeStyles = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-sm",
}

export function ShimmerBadge({
  children,
  variant = "new",
  size = "sm",
  className,
}: ShimmerBadgeProps) {
  const styles = variantStyles[variant]

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden",
        "rounded-full font-semibold tracking-wide uppercase",
        "shadow-lg",
        styles.bg,
        styles.text,
        sizeStyles[size],
        className
      )}
    >
      {/* Shimmer effect - continuous */}
      <span
        className={cn(
          "absolute inset-0",
          "bg-gradient-to-r from-transparent to-transparent",
          styles.shimmer,
          "animate-shimmer-badge"
        )}
        style={{ backgroundSize: "200% 100%" }}
      />

      {/* Subtle inner glow */}
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          "bg-gradient-to-b from-white/20 to-transparent",
          "opacity-60"
        )}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-1">
        {children}
      </span>
    </span>
  )
}

export default ShimmerBadge
