'use client'

import { useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { Brand } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

interface BrandsSectionProps {
  brands: Brand[]
}

function normalizeAccentColor(color?: string) {
  if (color && /^#[0-9A-Fa-f]{6}$/.test(color)) return color
  return '#2A9D8F'
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const railRef = useRef<HTMLDivElement | null>(null)

  const featuredBrands = useMemo(() => brands.slice(0, 3), [brands])
  const marqueeBrands = useMemo(() => [...brands, ...brands], [brands])

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-brand-header]',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      )

      gsap.fromTo(
        '[data-brand-card]',
        { opacity: 0, y: 60, rotateY: -5 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.95,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      )

      if (railRef.current) {
        const track = railRef.current
        const distance = track.scrollWidth / 2

        gsap.fromTo(
          track,
          { x: 0 },
          {
            x: -distance,
            duration: Math.max(20, brands.length * 3.5),
            ease: 'none',
            repeat: -1,
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [brands.length])

  if (brands.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f7f4ef] py-24 md:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,20,20,0.05),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(42,157,143,0.1),_transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2
              data-brand-header
              className="text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl lg:text-6xl"
            >
              Бренди, яким
              <span className="block text-[#6f4d2c]">справді хочеться довіряти</span>
            </h2>
          </div>

          <p
            data-brand-header
            className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg"
          >
            Офіційні партнери, професійні формули та лінійки, за якими повертаються
            не один раз. Тут важлива не лише назва, а й відчуття якості.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {featuredBrands.map((brand) => {
            const accent = normalizeAccentColor(brand.accentColor)
            const logoUrl = getImageUrl(brand.logo)
            const bannerUrl = getImageUrl(brand.banner)

            return (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                data-brand-card
                className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_50px_rgba(20,20,20,0.08)]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  {bannerUrl ? (
                    <Image
                      src={bannerUrl}
                      alt={brand.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover opacity-25 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="h-full w-full"
                      style={{
                        background: `linear-gradient(135deg, ${accent} 0%, rgba(20,20,20,0.92) 70%)`,
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.88)_30%,rgba(255,255,255,0.96)_100%)]" />
                </div>

                <div className="relative flex h-full flex-col justify-between p-7 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-neutral-600">
                      {brand.countryOfOrigin || 'Italy'}
                    </span>
                  </div>

                  <div className="mt-8">
                    {logoUrl ? (
                      <div className="relative h-12 w-[180px]">
                        <Image
                          src={logoUrl}
                          alt={brand.name}
                          fill
                          sizes="180px"
                          className="object-contain object-left"
                        />
                      </div>
                    ) : (
                      <h3 className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                        {brand.name}
                      </h3>
                    )}

                    <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-600 md:text-base">
                      {brand.shortDescription ||
                        'Професійний бренд з лінійками для салонного результату вдома та в роботі майстра.'}
                    </p>
                  </div>

                  <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    Перейти до бренду
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 p-4 shadow-soft backdrop-blur-xl">
          <div ref={railRef} className="flex w-max gap-4">
            {marqueeBrands.map((brand, index) => {
              const logoUrl = getImageUrl(brand.logo)

              return (
                <Link
                  key={`${brand.id}-${index}`}
                  href={`/brands/${brand.slug}`}
                  className="group flex h-[92px] min-w-[220px] items-center justify-center rounded-[1.5rem] border border-black/5 bg-[#faf8f5] px-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft"
                >
                  {logoUrl ? (
                    <div className="relative h-10 w-[150px]">
                      <Image
                        src={logoUrl}
                        alt={brand.name}
                        fill
                        sizes="150px"
                        loading="lazy"
                        className="object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <span className="text-base font-semibold text-neutral-600 group-hover:text-foreground">
                      {brand.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
