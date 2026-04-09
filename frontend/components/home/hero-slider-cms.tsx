'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BorderGradientButton } from '@/components/ui/border-gradient-button'
import { Banner, getImageUrl, isVideoMedia } from '@/lib/payload/types'
import { heroSlides } from '@/lib/constants/home-data'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

interface HeroSliderCMSProps {
  banners?: Banner[]
}

interface ResolvedSlide {
  id: string | number
  title: string
  subtitle: string
  link?: string
  mediaUrl?: string
  isVideo: boolean
  align: 'left' | 'center'
  buttons: Array<{
    text: string
    href: string
    variant: 'primary' | 'secondary'
  }>
}

export function HeroSliderCMS({ banners = [] }: HeroSliderCMSProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const slideRefs = useRef<Array<HTMLDivElement | null>>([])
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const slides = useMemo<ResolvedSlide[]>(() => {
    if (banners.length > 0) {
      return banners.map((banner, index) => ({
        id: banner.id,
        title: banner.title,
        subtitle: 'Професійний догляд для волосся від перевірених брендів.',
        link: banner.link || '/shop',
        mediaUrl: getImageUrl(banner.image) || undefined,
        isVideo: banner.mediaType === 'video' || isVideoMedia(banner.image),
        align: index % 2 === 0 ? 'center' : 'left',
        buttons: [
          { text: 'Перейти в каталог', href: banner.link || '/shop', variant: 'primary' },
          { text: 'Підібрати догляд', href: '/shop', variant: 'secondary' },
        ],
      }))
    }

    return heroSlides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      subtitle: slide.subtitle,
      link: slide.buttons[0]?.href,
      mediaUrl: slide.backgroundUrl,
      isVideo: slide.type === 'video',
      align: slide.align || 'center',
      buttons: slide.buttons,
    }))
  }, [banners])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-orb="left"]', {
        x: 18,
        y: -20,
        duration: 8,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })

      gsap.to('[data-hero-orb="right"]', {
        x: -24,
        y: 16,
        duration: 9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const activeSlide = slideRefs.current[selectedIndex]
    if (!activeSlide || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const media = activeSlide.querySelector<HTMLElement>('[data-hero-media]')
    const animatedItems = activeSlide.querySelectorAll<HTMLElement>('[data-hero-animate]')

    gsap.killTweensOf(media)
    gsap.killTweensOf(animatedItems)
    gsap.set(animatedItems, { opacity: 0, y: 32 })

    if (media) {
      gsap.fromTo(
        media,
        { scale: 1.12, filter: 'blur(8px)' },
        { scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'power2.out' }
      )

      gsap.to(media, {
        scale: 1.06,
        duration: 7,
        ease: 'none',
      })
    }

    gsap.to(animatedItems, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    })
  }, [selectedIndex])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#120f11] text-white"
    >
      <div
        data-hero-orb="left"
        className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-[#2A9D8F]/30 blur-3xl"
      />
      <div
        data-hero-orb="right"
        className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-[#D4A373]/25 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_40%),linear-gradient(135deg,_rgba(255,255,255,0.02),_transparent_35%)]" />

      <div className="embla relative h-[620px] overflow-hidden md:h-[680px] lg:h-[760px]" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              ref={(node) => {
                slideRefs.current[index] = node
              }}
              className="embla__slide relative min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              <div className="absolute inset-0">
                {slide.mediaUrl ? (
                  slide.isVideo ? (
                    <video
                      src={slide.mediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      data-hero-media
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      src={slide.mediaUrl}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      fetchPriority={index === 0 ? 'high' : undefined}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      sizes="100vw"
                      data-hero-media
                      className="object-cover"
                    />
                  )
                ) : (
                  <div
                    data-hero-media
                    className="h-full w-full bg-[linear-gradient(135deg,_#1a1a1a_0%,_#1f4642_48%,_#d4a373_100%)]"
                  />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(92deg,rgba(8,8,8,0.84)_0%,rgba(8,8,8,0.54)_42%,rgba(8,8,8,0.25)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(42,157,143,0.25),transparent_24%)]" />
              </div>

              <div className="relative h-full">
                <div className="mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
                  <div
                    className={`relative max-w-3xl ${
                      slide.align === 'center'
                        ? 'mx-auto items-center text-center'
                        : 'items-start text-left'
                    } flex flex-col`}
                  >
                    <h1
                      data-hero-animate
                      className="max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl"
                    >
                      {slide.title}
                    </h1>

                    <p
                      data-hero-animate
                      className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8"
                    >
                      {slide.subtitle}
                    </p>

                    <div
                      data-hero-animate
                      className="mt-8 flex flex-col gap-3 sm:flex-row"
                    >
                      {slide.buttons.map((button, buttonIndex) =>
                        button.variant === 'primary' ? (
                          <Link key={`${slide.id}-${buttonIndex}`} href={button.href}>
                            <BorderGradientButton
                              variant="white"
                              size="lg"
                              className="min-w-[220px] shadow-soft-lg"
                            >
                              {button.text}
                            </BorderGradientButton>
                          </Link>
                        ) : (
                          <Button
                            key={`${slide.id}-${buttonIndex}`}
                            asChild
                            size="lg"
                            className="h-14 min-w-[220px] rounded-full border border-white/20 bg-white/10 px-9 text-base text-white backdrop-blur-md hover:bg-white/15"
                          >
                            <Link href={button.href}>{button.text}</Link>
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#120f11] to-transparent" />

      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/10 focus-ring"
        aria-label="Попередній слайд"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/10 focus-ring"
        aria-label="Наступний слайд"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-10 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-xl">
        <span className="text-xs uppercase tracking-[0.24em] text-white/60">
          0{selectedIndex + 1}
        </span>
        <div className="flex flex-1 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => emblaApi?.scrollTo(index)}
              className="group relative h-2 flex-1 rounded-full bg-white/15 focus-ring"
              aria-label={`Слайд ${index + 1}`}
            >
              <span
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  selectedIndex === index ? 'bg-white opacity-100' : 'bg-white/35 opacity-0 group-hover:opacity-70'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-white/60">
          0{slides.length}
        </span>
      </div>
    </section>
  )
}
