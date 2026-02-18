'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Loader2 } from 'lucide-react'
import { getBrands } from '@/lib/payload/actions'
import type { Brand } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBrands() {
      setIsLoading(true)
      try {
        const data = await getBrands()
        setBrands(data)
      } catch (error) {
        console.error('Error fetching brands:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBrands()
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <ScrollReveal variant="fade-down" duration={400}>
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Головна
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground font-medium">Бренди</span>
            </nav>
          </div>
        </div>
      </ScrollReveal>

      {/* Header */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal variant="fade-up" duration={600}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Бренди, яким ми довіряємо
              </h1>
              <p className="text-lg text-muted-foreground">
                Офіційні партнери світових виробників професійної косметики для волосся
              </p>
            </div>
          </ScrollReveal>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brands.map((brand, index) => (
              <BrandCard key={brand.id} brand={brand} delay={index * 100} />
            ))}
          </div>

          {/* Empty state */}
          {brands.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Бренди поки не додані</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

interface BrandCardProps {
  brand: Brand
  delay?: number
}

function BrandCard({ brand, delay = 0 }: BrandCardProps) {
  const logoUrl = getImageUrl(brand.logo)

  return (
    <ScrollReveal variant="fade-up" delay={delay} duration={500}>
      <Link
        href={`/brands/${brand.slug}`}
        className="group block bg-card rounded-card p-6 shadow-soft border border-border hover:shadow-lift hover:border-foreground/20 transition-all duration-300 hover:-translate-y-1"
      >
        {/* Logo */}
        <div className="h-24 flex items-center justify-center mb-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={brand.name}
              width={120}
              height={80}
              className="object-contain max-h-20 group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: brand.accentColor || '#8B5CF6' }}
            >
              <span className="text-2xl font-bold text-white">
                {brand.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
            {brand.name}
          </h2>
          {brand.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {brand.shortDescription}
            </p>
          )}
          {brand.countryOfOrigin && (
            <p className="text-xs text-muted-foreground/70 mt-2">
              {brand.countryOfOrigin}
              {brand.foundedYear && ` • з ${brand.foundedYear}`}
            </p>
          )}
        </div>
      </Link>
    </ScrollReveal>
  )
}
