"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface FeatureGridProps {
  title?: string
  subtitle?: string
  features: Feature[]
  columns?: 2 | 3 | 4
}

export function FeatureGrid({ title, subtitle, features, columns = 3 }: FeatureGridProps) {
  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className="py-12">
      {(title || subtitle) && (
        <ScrollReveal variant="fade-up" className="text-center mb-12">
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
          )}
          {subtitle && (
            <p className="text-neutral-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </ScrollReveal>
      )}

      <div className={cn("grid gap-8", colsClass[columns])}>
        {features.map((feature, index) => (
          <ScrollReveal key={index} variant="fade-up" delay={index * 100}>
            <div className="text-center group">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2A9D8F]/10 to-[#48CAE4]/10 text-[#2A9D8F] mb-4 group-hover:from-[#2A9D8F] group-hover:to-[#48CAE4] group-hover:text-white transition-all duration-300 group-hover:scale-110">
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}

export default FeatureGrid
