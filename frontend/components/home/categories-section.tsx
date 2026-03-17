'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  BadgePercent,
  Droplets,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import type { Category } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

type CategoryVisualStyle = {
  icon: typeof Sparkles
  accent: string
  overlay: string
}

const categoryStyles = {
  hydration: {
    icon: Droplets,
    accent: 'bg-[#2A9D8F]/90 text-white',
    overlay: 'from-[#123332]/90 via-[#123332]/35 to-transparent',
  },
  softcare: {
    icon: Heart,
    accent: 'bg-white text-[#1A1A1A]',
    overlay: 'from-[#3d3028]/95 via-[#3d3028]/35 to-transparent',
  },
  repair: {
    icon: ShieldCheck,
    accent: 'bg-[#D4A373] text-[#1A1A1A]',
    overlay: 'from-[#3f2d18]/95 via-[#3f2d18]/30 to-transparent',
  },
  color: {
    icon: Sparkles,
    accent: 'bg-[#201d34] text-white',
    overlay: 'from-[#22192f]/95 via-[#22192f]/35 to-transparent',
  },
  styling: {
    icon: Star,
    accent: 'bg-[#1A1A1A] text-white',
    overlay: 'from-[#141414]/95 via-[#141414]/30 to-transparent',
  },
  accessories: {
    icon: BadgePercent,
    accent: 'bg-[#f6eee8] text-[#1A1A1A]',
    overlay: 'from-[#2a2520]/95 via-[#2a2520]/32 to-transparent',
  },
} satisfies Record<string, CategoryVisualStyle>

function resolveCategoryStyle(category: Category): CategoryVisualStyle {
  const source = `${category.slug} ${category.name}`.toLowerCase()

  if (
    source.includes('шамп') ||
    source.includes('shampoo') ||
    source.includes('hydrat') ||
    source.includes('зволож')
  ) {
    return categoryStyles.hydration
  }

  if (
    source.includes('конди') ||
    source.includes('condition') ||
    source.includes('бальзам') ||
    source.includes('мʼякіст') ||
    source.includes('мякіст')
  ) {
    return categoryStyles.softcare
  }

  if (
    source.includes('маск') ||
    source.includes('догляд') ||
    source.includes('repair') ||
    source.includes('віднов')
  ) {
    return categoryStyles.repair
  }

  if (
    source.includes('фарб') ||
    source.includes('color') ||
    source.includes('окисл') ||
    source.includes('знебарв') ||
    source.includes('освітл')
  ) {
    return categoryStyles.color
  }

  if (
    source.includes('стайл') ||
    source.includes('уклад') ||
    source.includes('styling') ||
    source.includes('volume')
  ) {
    return categoryStyles.styling
  }

  if (
    source.includes('аксес') ||
    source.includes('accessor') ||
    source.includes('інстру') ||
    source.includes('tool')
  ) {
    return categoryStyles.accessories
  }

  return categoryStyles.hydration
}

interface CategoriesSectionProps {
  categories: Category[]
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-categories-header]',
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
          },
        }
      )

      const cards = gsap.utils.toArray<HTMLElement>('[data-category-card]')

      gsap.fromTo(
        cards,
        { opacity: 0, y: 80, rotateX: -10 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
          },
        }
      )

      cards.forEach((card) => {
        const media = card.querySelector<HTMLElement>('[data-category-media]')
        if (!media) return

        gsap.fromTo(
          media,
          { scale: 1.12, yPercent: -4 },
          {
            scale: 1,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  if (categories.length === 0) return null

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#f6f2ed] py-24 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(42,157,143,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(212,163,115,0.18),_transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          data-categories-header
          className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-[#1A1A1A] shadow-soft">
              <Sparkles className="h-4 w-4 text-[#2A9D8F]" />
              pick your hair mood
            </div>
            <h2 className="mt-6 text-4xl font-semibold tracking-[-0.05em] text-foreground md:text-5xl lg:text-6xl">
              Догляд, який хочеться
              <span className="block text-[#8e5a2b]">додати в сторіс і в кошик</span>
            </h2>
          </div>

          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Ми перетворили каталог на moodboard для блиску, обʼєму, кольору й відновлення.
            Обирайте категорію як вайб, а не як просто фільтр.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => {
            const imageUrl =
              getImageUrl(category.banner) ||
              getImageUrl(category.icon) ||
              '/images/categories/cat-placeholder.jpg'
            const style = resolveCategoryStyle(category)
            const Icon = style.icon

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                data-category-card
                className="group relative min-h-[340px] overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_50px_rgba(20,20,20,0.08)] md:min-h-[380px]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    data-category-media
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${style.overlay}`} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_30%)] opacity-60" />
                </div>

                <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${style.accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="max-w-sm">
                    <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                      {category.name}
                    </h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/82 md:text-base">
                      {category.shortDescription ||
                        'Формули, текстури й ефекти, які роблять волосся головним аксесуаром образу.'}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-transform duration-300 group-hover:translate-x-1">
                      Перейти в категорію
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
