'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { PromoBlock, getImageUrl } from '@/lib/payload/types'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

interface PromoBlocksProps {
  blocks: PromoBlock[]
}

export function PromoBlocks({ blocks }: PromoBlocksProps) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-promo-header]',
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

      const cards = gsap.utils.toArray<HTMLElement>('[data-promo-card]')

      gsap.fromTo(
        cards,
        { opacity: 0, y: 70, rotateY: -6 },
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

      cards.forEach((card) => {
        const media = card.querySelector<HTMLElement>('[data-promo-media]')
        if (!media) return

        gsap.fromTo(
          media,
          { scale: 1.08, yPercent: -6 },
          {
            scale: 1,
            yPercent: 6,
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

  if (blocks.length === 0) return null

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#141112] py-24 text-white md:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(212,163,115,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(42,157,143,0.18),_transparent_32%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h2
              data-promo-header
              className="text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl lg:text-6xl"
            >
              Гарячі пропозиції,
              <span className="block text-[#D4A373]">які не хочеться пропускати</span>
            </h2>
          </div>

          <p
            data-promo-header
            className="max-w-xl text-base leading-7 text-white/70 md:text-lg"
          >
            Тут зібрані акцентні пропозиції, нові запуски й короткі вікна вигідних покупок,
            щоб головна сторінка справді жила.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {blocks.map((block) => {
            const imageUrl = getImageUrl(block.image)

            return (
              <div
                key={block.id}
                data-promo-card
                className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-7 shadow-[0_22px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-8"
                style={{ backgroundColor: block.backgroundColor || undefined }}
              >
                <div className="absolute inset-0 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={block.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      data-promo-media
                      className="object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      data-promo-media
                      className="h-full w-full bg-[linear-gradient(135deg,_rgba(42,157,143,0.55),_rgba(20,17,18,0.92)_58%,_rgba(212,163,115,0.45))]"
                    />
                  )}

                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.15),rgba(10,10,10,0.78))]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_24%)]" />
                </div>

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <h3 className="max-w-sm text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
                      {block.title}
                    </h3>

                    {block.description && (
                      <p className="mt-4 max-w-sm text-sm leading-7 text-white/72 md:text-base">
                        {typeof block.description === 'string' ? block.description : ''}
                      </p>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col gap-4">
                    {block.expiresAt && (
                      <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md">
                        <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
                          до завершення
                        </p>
                        <CountdownTimer targetDate={block.expiresAt} />
                      </div>
                    )}

                    {block.buttonLink && block.buttonText && (
                      <Link
                        href={block.buttonLink}
                        className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition-all duration-300 hover:translate-x-1 hover:bg-[#f5f1ec]"
                      >
                        {block.buttonText}
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
