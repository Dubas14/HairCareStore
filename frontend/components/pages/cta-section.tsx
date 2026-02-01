"use client"

import * as React from "react"
import Link from "next/link"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { BorderGradientButton } from "@/components/ui/border-gradient-button"
import { cn } from "@/lib/utils"

interface CTASectionProps {
  title: string
  description?: string
  buttonText: string
  buttonLink: string
  variant?: "teal" | "warm" | "dark"
}

const variantStyles = {
  teal: {
    bg: "from-[#2A9D8F] to-[#48CAE4]",
    text: "text-white",
    buttonVariant: "white" as const,
  },
  warm: {
    bg: "from-[#D4A373] to-[#E9C46A]",
    text: "text-[#1A1A1A]",
    buttonVariant: "mono" as const,
  },
  dark: {
    bg: "from-[#1A1A1A] to-[#264653]",
    text: "text-white",
    buttonVariant: "white" as const,
  },
}

export function CTASection({ title, description, buttonText, buttonLink, variant = "teal" }: CTASectionProps) {
  const styles = variantStyles[variant]

  return (
    <ScrollReveal variant="fade-up">
      <div className={cn("relative rounded-3xl overflow-hidden bg-gradient-to-r p-8 md:p-12", styles.bg)}>
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className={cn("text-center md:text-left", styles.text)}>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            {description && (
              <p className="text-white/80 max-w-md">{description}</p>
            )}
          </div>

          <Link href={buttonLink}>
            <BorderGradientButton variant={styles.buttonVariant} size="lg">
              {buttonText}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </BorderGradientButton>
          </Link>
        </div>
      </div>
    </ScrollReveal>
  )
}

export default CTASection
