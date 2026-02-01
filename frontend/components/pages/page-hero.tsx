"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

// Icon components
const icons = {
  delivery: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  payment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    </svg>
  ),
  contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  ),
}

type IconType = keyof typeof icons

interface PageHeroProps {
  title: string
  subtitle?: string
  icon?: IconType
  gradient?: "teal" | "warm" | "purple" | "olive"
}

const gradientStyles = {
  teal: {
    bg: "from-[#2A9D8F]/10 via-[#48CAE4]/5 to-transparent",
    icon: "from-[#2A9D8F] to-[#48CAE4]",
    glow: "bg-[#2A9D8F]/20",
  },
  warm: {
    bg: "from-[#D4A373]/10 via-[#E9C46A]/5 to-transparent",
    icon: "from-[#D4A373] to-[#E9C46A]",
    glow: "bg-[#D4A373]/20",
  },
  purple: {
    bg: "from-[#B8B8D1]/10 via-[#9FA0C3]/5 to-transparent",
    icon: "from-[#B8B8D1] to-[#9FA0C3]",
    glow: "bg-[#B8B8D1]/20",
  },
  olive: {
    bg: "from-[#606C38]/10 via-[#8A9A5B]/5 to-transparent",
    icon: "from-[#606C38] to-[#8A9A5B]",
    glow: "bg-[#606C38]/20",
  },
}

export function PageHero({ title, subtitle, icon, gradient = "teal" }: PageHeroProps) {
  const styles = gradientStyles[gradient]
  const IconComponent = icon ? icons[icon] : null

  return (
    <div className={cn("relative overflow-hidden bg-gradient-to-b", styles.bg)}>
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn("absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl", styles.glow)} />
        <div className={cn("absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl", styles.glow)} />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24">
        <ScrollReveal variant="fade-down" duration={500}>
          <div className="flex flex-col items-center text-center">
            {/* Icon */}
            {IconComponent && (
              <div className="relative mb-6">
                <div className={cn(
                  "w-20 h-20 rounded-2xl bg-gradient-to-br p-[2px]",
                  styles.icon
                )}>
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                    <div className={cn("w-10 h-10 bg-gradient-to-br bg-clip-text", styles.icon)}>
                      <div className="text-[#1A1A1A]">
                        {IconComponent}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] animate-float opacity-60" />
                <div className="absolute -bottom-1 -left-3 w-2 h-2 rounded-full bg-gradient-to-br from-[#D4A373] to-[#E9C46A] animate-float opacity-60" style={{ animationDelay: '1s' }} />
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-lg md:text-xl text-neutral-600 max-w-2xl">
                {subtitle}
              </p>
            )}

            {/* Decorative line */}
            <div className="mt-8 flex items-center gap-2">
              <div className={cn("w-12 h-0.5 rounded-full bg-gradient-to-r", styles.icon)} />
              <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", styles.icon)} />
              <div className={cn("w-12 h-0.5 rounded-full bg-gradient-to-l", styles.icon)} />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}

export default PageHero
