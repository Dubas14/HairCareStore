'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Check, Mail, Sparkles } from 'lucide-react'
import { BorderGradientButton } from '@/components/ui/border-gradient-button'
import { subscribeToNewsletter } from '@/app/actions/newsletter'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

const perks = [
  'секретні пропозиції та нові бренди',
  'знижки для своїх раніше за інших',
  'корисні нагадування без спаму',
]

export function NewsletterSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-newsletter-panel]')

      const panelsTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 82%',
          toggleActions: 'restart none restart none',
        },
      })

      panelsTimeline
        .fromTo(
          panels,
          {
            opacity: 0,
            y: 48,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.82,
            stagger: 0.08,
            ease: 'power3.out',
          }
        )
        .to(
          panels,
          {
            rotate: -12,
            x: -10,
            duration: 0.34,
            stagger: 0.05,
            ease: 'power2.out',
            transformOrigin: '100% 50%',
          },
          0.16
        )
        .to(
          panels,
          {
            rotate: 0,
            x: 0,
            duration: 0.62,
            stagger: 0.05,
            ease: 'back.out(1.6)',
          },
          0.44
        )

      gsap.fromTo(
        '[data-newsletter-copy]',
        { opacity: 0, y: 44 },
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

      gsap.to('[data-newsletter-orb="a"]', {
        x: 18,
        y: -22,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.to('[data-newsletter-orb="b"]', {
        x: -20,
        y: 16,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      gsap.utils.toArray<HTMLElement>('[data-newsletter-chip]').forEach((chip, index) => {
        gsap.to(chip, {
          y: index % 2 === 0 ? -12 : 10,
          rotation: index % 2 === 0 ? -2 : 2,
          duration: 3.4 + index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await subscribeToNewsletter(formData)

      if (result.success) {
        setMessage({ type: 'success', text: result.message! })
        form.reset()
      } else {
        setMessage({ type: 'error', text: result.error! })
      }
    })
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#140f14] py-20 text-white md:py-24"
    >
      <div
        data-newsletter-orb="a"
        className="absolute left-0 top-10 h-40 w-40 rounded-full bg-[#2A9D8F]/30 blur-3xl"
      />
      <div
        data-newsletter-orb="b"
        className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-[#D4A373]/20 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.06),_transparent_35%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
        <div data-newsletter-panel className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-8 backdrop-blur-xl md:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />

          <h2
            data-newsletter-copy
            className="relative max-w-2xl text-4xl font-semibold tracking-[-0.05em] md:text-5xl"
          >
            <span className="block">Листи, від яких хочеться</span>
            <span className="block text-[#D4A373]">не відписуватись, а чекати</span>
          </h2>

          <p
            data-newsletter-copy
            className="relative mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg"
          >
            Підписка для тих, хто любить красиве волосся, нові запуски і відчуття, що
            улюблений магазин знає, чим вас здивувати.
          </p>

          <div data-newsletter-copy className="relative mt-8 grid gap-3 md:grid-cols-3">
            {perks.map((perk) => (
              <div
                key={perk}
                className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/80"
              >
                {perk}
              </div>
            ))}
          </div>

          <div data-newsletter-copy className="relative mt-8 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#1A1A1A]">
              <Sparkles className="h-4 w-4 text-[#2A9D8F]" />
              -10% на першу покупку
            </div>
          </div>
        </div>

        <div
          data-newsletter-panel
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#f8f3ee] p-8 text-[#1A1A1A] shadow-[0_18px_60px_rgba(0,0,0,0.14)] md:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(42,157,143,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(212,163,115,0.18),_transparent_34%)]" />

          <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A1A] text-white shadow-soft-lg">
            <Mail className="h-6 w-6" />
          </div>

          <h3 className="relative mt-6 text-2xl font-semibold tracking-[-0.04em] md:text-3xl">
            Підписатися на розсилку
          </h3>
          <p className="relative mt-3 text-sm leading-6 text-neutral-600">
            Лише красиві листи, ексклюзивні офери й жодного відчуття “навіщо я це
            відкрила”.
          </p>

          <form onSubmit={handleSubmit} className="relative mt-8 space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Ваш email"
              required
              disabled={isPending}
              className="w-full rounded-[1.2rem] border border-black/8 bg-white px-5 py-4 text-foreground shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/20 disabled:opacity-50"
            />

            <div className="flex items-start gap-3 rounded-2xl bg-black/[0.03] px-4 py-3">
              <input
                type="checkbox"
                name="consent"
                id="consent"
                required
                disabled={isPending}
                className="mt-1 h-4 w-4 rounded accent-[#1A1A1A]"
              />
              <label htmlFor="consent" className="text-sm leading-6 text-neutral-600">
                Я погоджуюсь з умовами розсилки та політикою приватності
              </label>
            </div>

            <BorderGradientButton
              type="submit"
              disabled={isPending}
              variant="mono"
              size="lg"
              className="w-full"
            >
              {isPending ? 'Підписуємо...' : 'Хочу красиві листи'}
            </BorderGradientButton>

            {message && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-[#2A9D8F]/15 text-[#15554d]'
                    : 'bg-[#BC4749]/12 text-[#8c3133]'
                }`}
              >
                {message.type === 'success' && <Check className="h-4 w-4" />}
                <p>{message.text}</p>
              </div>
            )}
          </form>

        </div>
      </div>
    </section>
  )
}
