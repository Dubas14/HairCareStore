"use client"

import * as React from "react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { cn } from "@/lib/utils"

interface TimelineStep {
  number: number
  title: string
  description: string
}

interface ProcessTimelineProps {
  title?: string
  steps: TimelineStep[]
  variant?: "horizontal" | "vertical"
}

export function ProcessTimeline({ title, steps, variant = "horizontal" }: ProcessTimelineProps) {
  if (variant === "vertical") {
    return <VerticalTimeline title={title} steps={steps} />
  }

  return (
    <div className="py-12">
      {title && (
        <ScrollReveal variant="fade-up">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">{title}</h2>
        </ScrollReveal>
      )}

      <div className="relative">
        {/* Connection line */}
        <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2A9D8F]/20 to-transparent" />

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} variant="fade-up" delay={index * 100}>
              <div className="relative flex flex-col items-center text-center group">
                {/* Step number */}
                <div className="relative mb-6">
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-[#2A9D8F]/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Number circle */}
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] p-[2px] group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <span className="text-3xl font-bold bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Connector dot */}
                  <div className="hidden md:block absolute -bottom-6 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#2A9D8F]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}

function VerticalTimeline({ title, steps }: { title?: string; steps: TimelineStep[] }) {
  return (
    <div className="py-12">
      {title && (
        <ScrollReveal variant="fade-up">
          <h2 className="text-2xl md:text-3xl font-bold mb-12">{title}</h2>
        </ScrollReveal>
      )}

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2A9D8F] via-[#48CAE4] to-[#2A9D8F]/20" />

        <div className="space-y-8">
          {steps.map((step, index) => (
            <ScrollReveal key={step.number} variant="fade-left" delay={index * 100}>
              <div className="relative flex gap-6 md:gap-8 group">
                {/* Step number */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] p-[2px] group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <span className="text-lg md:text-xl font-bold bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content card */}
                <div className="flex-1 bg-white rounded-2xl border border-neutral-100 p-6 shadow-soft group-hover:shadow-soft-lg group-hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProcessTimeline
