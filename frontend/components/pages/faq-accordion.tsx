"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  title?: string
  items: FAQItem[]
}

export function FAQAccordion({ title, items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  return (
    <div className="py-12">
      {title && (
        <ScrollReveal variant="fade-up">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">{title}</h2>
        </ScrollReveal>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <ScrollReveal key={index} variant="fade-up" delay={index * 50}>
            <div
              className={cn(
                "rounded-2xl border transition-all duration-300 overflow-hidden",
                openIndex === index
                  ? "border-[#2A9D8F]/30 bg-gradient-to-br from-[#2A9D8F]/5 to-transparent shadow-soft"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-[#1A1A1A] pr-4">{item.question}</span>
                <span
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                    openIndex === index
                      ? "bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] text-white rotate-180"
                      : "bg-neutral-100 text-neutral-600"
                  )}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
                  </svg>
                </span>
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300",
                  openIndex === index ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6 text-neutral-600 leading-relaxed">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}

export default FAQAccordion
