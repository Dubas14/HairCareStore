"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

interface ContactCardProps {
  icon: React.ReactNode
  title: string
  value: string
  link?: string
  description?: string
  delay?: number
}

export function ContactCard({ icon, title, value, link, description, delay = 0 }: ContactCardProps) {
  const Wrapper = link ? "a" : "div"
  const wrapperProps = link ? { href: link, target: link.startsWith("http") ? "_blank" : undefined } : {}

  return (
    <ScrollReveal variant="fade-up" delay={delay}>
      <Wrapper
        {...wrapperProps}
        className={cn(
          "block p-6 rounded-2xl bg-white border border-neutral-100 shadow-soft",
          "transition-all duration-300 group",
          link && "hover:shadow-soft-lg hover:-translate-y-1 hover:border-[#2A9D8F]/20 cursor-pointer"
        )}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2A9D8F]/10 to-[#48CAE4]/10 flex items-center justify-center text-[#2A9D8F] group-hover:from-[#2A9D8F] group-hover:to-[#48CAE4] group-hover:text-white transition-all duration-300">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-1">{title}</p>
            <p className="font-semibold text-[#1A1A1A] group-hover:text-[#2A9D8F] transition-colors">
              {value}
            </p>
            {description && (
              <p className="text-sm text-neutral-500 mt-1">{description}</p>
            )}
          </div>

          {/* Arrow for links */}
          {link && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-5 h-5 text-[#2A9D8F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
              </svg>
            </div>
          )}
        </div>
      </Wrapper>
    </ScrollReveal>
  )
}

// Social link button
interface SocialLinkProps {
  icon: React.ReactNode
  label: string
  href: string
  color?: string
}

export function SocialLink({ icon, label, href, color = "#1A1A1A" }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-100 hover:border-transparent hover:shadow-lg transition-all duration-300"
      style={{ ["--social-color" as string]: color }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: `${color}10` }}
      >
        <div className="text-[var(--social-color)]">{icon}</div>
      </div>
      <span className="font-medium text-neutral-700 group-hover:text-[var(--social-color)] transition-colors">
        {label}
      </span>
    </a>
  )
}

export default ContactCard
