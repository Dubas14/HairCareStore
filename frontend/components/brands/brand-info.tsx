'use client'

import { Brand, BenefitItem } from '@/lib/strapi/client'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { ExternalLink } from 'lucide-react'

interface BrandInfoProps {
  brand: Brand
}

export function BrandInfo({ brand }: BrandInfoProps) {
  const hasHistory = brand.history && typeof brand.history === 'string' && brand.history.trim().length > 0
  const hasBenefits = brand.benefits && brand.benefits.length > 0

  if (!hasHistory && !hasBenefits) return null

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* History Section */}
          {hasHistory && (
            <ScrollReveal variant="fade-up" duration={600}>
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                  Про бренд {brand.name}
                </h2>
                <div
                  className="prose prose-lg max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: brand.history as string }}
                />
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-6 text-primary hover:text-primary/80 transition-colors"
                  >
                    Офіційний сайт
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </ScrollReveal>
          )}

          {/* Benefits Section */}
          {hasBenefits && (
            <ScrollReveal variant="fade-up" delay={200} duration={600}>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                  Переваги {brand.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {brand.benefits!.map((benefit, index) => (
                    <BenefitCard
                      key={benefit.id || index}
                      benefit={benefit}
                      accentColor={brand.accentColor}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </div>
    </section>
  )
}

interface BenefitCardProps {
  benefit: BenefitItem
  accentColor?: string
  delay?: number
}

function BenefitCard({ benefit, accentColor, delay = 0 }: BenefitCardProps) {
  return (
    <ScrollReveal variant="fade-up" delay={delay} duration={500}>
      <div className="bg-card rounded-card p-6 shadow-soft border border-border hover:shadow-lift transition-all duration-300">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${accentColor || '#8B5CF6'}20` }}
          >
            {benefit.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              {benefit.title}
            </h3>
            {benefit.description && (
              <p className="text-sm text-muted-foreground">
                {benefit.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </ScrollReveal>
  )
}
