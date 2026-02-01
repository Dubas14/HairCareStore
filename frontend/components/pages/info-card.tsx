"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

interface InfoCardProps {
  icon: React.ReactNode
  title: string
  description: string
  variant?: "default" | "highlight" | "outline"
  delay?: number
}

const variantStyles = {
  default: "bg-white border border-neutral-100 shadow-soft hover:shadow-soft-lg",
  highlight: "bg-gradient-to-br from-[#2A9D8F]/5 to-[#48CAE4]/5 border border-[#2A9D8F]/10",
  outline: "bg-transparent border-2 border-neutral-200 hover:border-[#2A9D8F]/30",
}

export function InfoCard({ icon, title, description, variant = "default", delay = 0 }: InfoCardProps) {
  return (
    <ScrollReveal variant="fade-up" delay={delay}>
      <div
        className={cn(
          "relative p-6 rounded-2xl transition-all duration-300 group",
          "hover:-translate-y-1",
          variantStyles[variant]
        )}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] p-[1.5px] mb-4">
          <div className="w-full h-full rounded-xl bg-white flex items-center justify-center text-[#2A9D8F] group-hover:bg-gradient-to-br group-hover:from-[#2A9D8F] group-hover:to-[#48CAE4] group-hover:text-white transition-all duration-300">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 text-[#1A1A1A]">{title}</h3>
        <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
      </div>
    </ScrollReveal>
  )
}

interface InfoCardGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
}

export function InfoCardGrid({ children, columns = 3 }: InfoCardGridProps) {
  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-6", colsClass[columns])}>
      {children}
    </div>
  )
}

export default InfoCard
