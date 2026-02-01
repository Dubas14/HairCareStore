"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BorderGradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "teal" | "warm" | "mono" | "white"
  size?: "sm" | "md" | "lg"
}

const variantStyles = {
  teal: {
    gradient: "from-[#2A9D8F] via-[#48CAE4] to-[#2A9D8F]",
    text: "text-[#1A1A1A]",
    hoverText: "group-hover:text-[#2A9D8F]",
    bg: "bg-white",
  },
  warm: {
    gradient: "from-[#D4A373] via-[#E9C46A] to-[#D4A373]",
    text: "text-[#1A1A1A]",
    hoverText: "group-hover:text-[#D4A373]",
    bg: "bg-white",
  },
  mono: {
    gradient: "from-[#1A1A1A] via-[#717171] to-[#1A1A1A]",
    text: "text-[#1A1A1A]",
    hoverText: "group-hover:text-[#1A1A1A]",
    bg: "bg-white",
  },
  white: {
    gradient: "from-white via-white/80 to-white",
    text: "text-white",
    hoverText: "group-hover:text-[#1A1A1A]",
    bg: "bg-[#1A1A1A]",
  },
}

const sizeStyles = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-7 text-[15px]",
  lg: "h-14 px-9 text-base",
}

export function BorderGradientButton({
  children,
  variant = "teal",
  size = "md",
  className,
  ...props
}: BorderGradientButtonProps) {
  const styles = variantStyles[variant]

  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center gap-2",
        "rounded-full font-medium tracking-[-0.01em]",
        "transition-all duration-300",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "bg-transparent p-[2px]",
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {/* Animated gradient border */}
      <span
        className={cn(
          "absolute inset-0 rounded-full",
          "bg-gradient-to-r",
          styles.gradient,
          "opacity-30 transition-opacity duration-300",
          "group-hover:opacity-100",
          "animate-border-flow"
        )}
        style={{ backgroundSize: "200% 100%" }}
      />

      {/* Inner background */}
      <span
        className={cn(
          "absolute inset-[2px] rounded-full",
          styles.bg,
          "transition-all duration-300"
        )}
      />

      {/* Content */}
      <span
        className={cn(
          "relative z-10 flex items-center justify-center gap-2",
          "transition-colors duration-300",
          styles.text,
          styles.hoverText
        )}
      >
        {children}
      </span>
    </button>
  )
}

export default BorderGradientButton
