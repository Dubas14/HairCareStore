'use client'

import { useInView } from 'react-intersection-observer'
import { benefits } from '@/lib/constants/home-data'

export function BenefitsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="section-spacing bg-footer relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-hydrate-start/10 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-footer-foreground mb-4 tracking-tight">
            Чому обирають нас
          </h2>
        </div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`group p-8 rounded-card border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300 ${
                inView ? 'animate-fadeInScale' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-footer-foreground mb-3">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-white/70 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
