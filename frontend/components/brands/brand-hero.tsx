'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Brand, getImageUrl, isVideoMedia } from '@/lib/payload/types'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface BrandHeroProps {
  brand: Brand
}

export function BrandHero({ brand }: BrandHeroProps) {
  const bannerUrl = getImageUrl(brand.banner)
  const logoUrl = getImageUrl(brand.logo)
  const isVideo = isVideoMedia(brand.banner)

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
              <Link href="/brands" className="text-muted-foreground hover:text-foreground transition-colors">
                Бренди
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{brand.name}</span>
            </nav>
          </div>
        </div>
      </ScrollReveal>

      {/* Hero Banner */}
      <ScrollReveal variant="fade-up" duration={600}>
        {bannerUrl ? (
          <div className="relative">
            {/* Banner Image - natural aspect ratio */}
            {isVideo ? (
              <video
                src={bannerUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-[70vh] object-cover"
              />
            ) : (
              <Image
                src={bannerUrl}
                alt={brand.name}
                width={1920}
                height={1080}
                unoptimized
                className="w-full h-auto max-h-[70vh] object-cover"
                priority
              />
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Content over banner */}
            <div className="absolute bottom-0 left-0 right-0">
              <div className="container mx-auto px-4 pb-6 md:pb-10">
                <BrandInfo brand={brand} logoUrl={logoUrl} light />
              </div>
            </div>
          </div>
        ) : (
          /* Fallback: colored background */
          <div
            className="relative py-12 md:py-20"
            style={{
              background: `linear-gradient(135deg, ${brand.accentColor || '#8B5CF6'} 0%, ${brand.accentColor || '#8B5CF6'}88 100%)`,
            }}
          >
            <div className="container mx-auto px-4">
              <BrandInfo brand={brand} logoUrl={logoUrl} light />
            </div>
          </div>
        )}
      </ScrollReveal>
    </section>
  )
}

interface BrandInfoProps {
  brand: Brand
  logoUrl: string | null
  light?: boolean
}

function BrandInfo({ brand, logoUrl, light }: BrandInfoProps) {
  const textColor = light ? 'text-white' : 'text-foreground'
  const mutedColor = light ? 'text-white/70' : 'text-muted-foreground'

  return (
    <div className="flex items-center gap-6">
      {/* Logo */}
      {logoUrl ? (
        <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 backdrop-blur-sm rounded-card p-4 flex items-center justify-center flex-shrink-0">
          <Image
            src={logoUrl}
            alt={brand.name}
            width={80}
            height={80}
            unoptimized
            className="object-contain"
          />
        </div>
      ) : (
        <div
          className="w-20 h-20 md:w-28 md:h-28 rounded-card flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: light ? 'rgba(255,255,255,0.2)' : (brand.accentColor || '#8B5CF6') }}
        >
          <span className={`text-3xl md:text-4xl font-bold ${light ? 'text-white' : 'text-white'}`}>
            {brand.name.charAt(0)}
          </span>
        </div>
      )}

      <div>
        <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold ${textColor} mb-2`}>
          {brand.name}
        </h1>
        {brand.shortDescription && (
          <p className={`text-lg ${mutedColor} max-w-2xl`}>
            {brand.shortDescription}
          </p>
        )}
        {/* Meta info */}
        <div className={`flex flex-wrap items-center gap-4 mt-3 text-sm ${mutedColor}`}>
          {brand.countryOfOrigin && (
            <span className="flex items-center gap-1">
              <span className={light ? 'text-white/50' : 'text-muted-foreground/70'}>Країна:</span>
              {brand.countryOfOrigin}
            </span>
          )}
          {brand.foundedYear && (
            <span className="flex items-center gap-1">
              <span className={light ? 'text-white/50' : 'text-muted-foreground/70'}>Рік заснування:</span>
              {brand.foundedYear}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
