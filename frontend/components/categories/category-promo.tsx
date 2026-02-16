'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CategoryPromoBlock, getImageUrl } from '@/lib/payload/types'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Button } from '@/components/ui/button'

interface CategoryPromoProps {
  promoBlock: CategoryPromoBlock
  accentColor?: string
}

export function CategoryPromo({ promoBlock, accentColor }: CategoryPromoProps) {
  const imageUrl = getImageUrl(promoBlock.image)

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <ScrollReveal variant="fade-up" duration={600}>
          <div
            className="relative overflow-hidden rounded-card"
            style={{
              backgroundColor: accentColor ? `${accentColor}15` : 'hsl(var(--muted))'
            }}
          >
            <div className="flex flex-col md:flex-row items-center">
              {/* Content */}
              <div className="flex-1 p-6 md:p-8 lg:p-12">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  {promoBlock.title}
                </h3>
                {promoBlock.description && (
                  <p className="text-muted-foreground mb-6 max-w-md">
                    {promoBlock.description}
                  </p>
                )}
                {promoBlock.link && (
                  <Button
                    asChild
                    className="group"
                    style={{
                      backgroundColor: accentColor || undefined
                    }}
                  >
                    <Link href={promoBlock.link}>
                      {promoBlock.buttonText || 'Детальніше'}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Image */}
              {imageUrl && (
                <div className="relative w-full md:w-1/3 h-[200px] md:h-[250px]">
                  <Image
                    src={imageUrl}
                    alt={promoBlock.title || ''}
                    fill
                    className="object-contain object-center md:object-right"
                  />
                </div>
              )}
            </div>

            {/* Decorative gradient */}
            {accentColor && (
              <div
                className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at 100% 50%, ${accentColor}, transparent 70%)`
                }}
              />
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
