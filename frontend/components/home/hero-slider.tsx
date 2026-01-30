'use client'

import { useCallback, useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { heroSlides } from '@/lib/constants/home-data'
import { Button } from '@/components/ui/button'

export function HeroSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  return (
    <section className="relative w-full h-[500px] md:h-[450px] lg:h-[600px] overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="embla__slide relative flex-[0_0_100%] min-w-0">
              {/* Background */}
              <div className="absolute inset-0">
                {slide.type === 'image' ? (
                  <img
                    src={slide.backgroundUrl}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={slide.backgroundUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Content */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={`h-full flex flex-col justify-center ${
                    slide.align === 'center' ? 'items-center text-center' : 'items-start text-left'
                  } max-w-2xl ${slide.align === 'center' ? 'mx-auto' : ''}`}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fadeInUp">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 mb-8 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                    {slide.buttons.map((button, idx) => (
                      <Button
                        key={idx}
                        asChild
                        variant={button.variant === 'primary' ? 'default' : 'outline'}
                        size="lg"
                        className={
                          button.variant === 'primary'
                            ? 'bg-gold hover:bg-gold/90 text-white border-0 shadow-lg hover:shadow-gold/50 hover:scale-105 transition-all duration-250'
                            : 'border-white/50 text-white hover:bg-white/10 hover:scale-105 transition-all duration-250'
                        }
                      >
                        <Link href={button.href}>{button.text}</Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-250 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-250 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-all duration-250"
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
