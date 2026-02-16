'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Category, getImageUrl, isVideoMedia } from '@/lib/payload/types'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface CategoryHeroProps {
  category: Category
}

export function CategoryHero({ category }: CategoryHeroProps) {
  const bannerUrl = getImageUrl(category.banner)
  const iconUrl = getImageUrl(category.icon)
  const isVideo = isVideoMedia(category.banner)

  return (
    <section className="relative">
      {/* Breadcrumbs */}
      <ScrollReveal variant="fade-down" duration={400}>
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Головна
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                Каталог
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{category.name}</span>
            </nav>
          </div>
        </div>
      </ScrollReveal>

      {/* Hero Banner */}
      <ScrollReveal variant="fade-up" duration={600}>
        <div className="relative h-[300px] md:h-[400px] overflow-hidden">
          {/* Background */}
          {bannerUrl ? (
            isVideo ? (
              <video
                src={bannerUrl}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={bannerUrl}
                alt={category.name}
                fill
                className="object-cover"
                priority
              />
            )
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: category.accentColor || '#8B5CF6',
                opacity: 0.2
              }}
            />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Accent Color Overlay */}
          {category.accentColor && (
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: category.accentColor }}
            />
          )}

          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-8 md:pb-12">
              <div className="flex items-center gap-4 mb-4">
                {iconUrl && (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-card p-3 flex items-center justify-center">
                    <Image
                      src={iconUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {category.name}
                  </h1>
                  {category.shortDescription && (
                    <p className="text-lg text-white/80 max-w-2xl">
                      {category.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
