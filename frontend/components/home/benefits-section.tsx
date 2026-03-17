'use client'

import { useEffect, useRef } from 'react'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

const BenefitIcon = ({ type }: { type: 'quiz' | 'original' | 'delivery' | 'bonus' }) => {
  const iconClass = 'h-7 w-7 text-[#2A9D8F]'

  switch (type) {
    case 'quiz':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      )
    case 'original':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    case 'delivery':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.656c0-.424-.243-.813-.622-1.01l-2.628-1.371c-.405-.211-.874-.322-1.35-.322H9.75m5.25 7.5V6.75a3 3 0 00-3-3H6.75a3 3 0 00-3 3v8.625c0 .621.504 1.125 1.125 1.125h.375" />
        </svg>
      )
    case 'bonus':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      )
  }
}

const benefits = [
  {
    id: 1,
    icon: 'quiz' as const,
    title: 'Персональний підбір',
    description: 'Допоможемо обрати ідеальні продукти саме під тип волосся, стан і бажаний результат.',
  },
  {
    id: 2,
    icon: 'original' as const,
    title: '100% оригінал',
    description: 'Працюємо лише з офіційними брендами та постачальниками, без випадкових поставок.',
  },
  {
    id: 3,
    icon: 'delivery' as const,
    title: 'Швидка доставка',
    description: 'Надсилаємо замовлення по всій Україні, щоб ваш догляд приїхав без довгого очікування.',
  },
  {
    id: 4,
    icon: 'bonus' as const,
    title: 'Бонусна програма',
    description: 'Накопичуйте бали, повертайтесь за улюбленими засобами та отримуйте приємні знижки.',
  },
]

export function BenefitsSection() {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-benefits-card]',
        { opacity: 0, y: 48, rotateX: -6 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-16 md:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(42,157,143,0.08),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(212,163,115,0.12),_transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              data-benefits-card
              className="group relative min-h-[220px] overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#fbf8f4] p-6 shadow-[0_14px_38px_rgba(20,20,20,0.06)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.55),transparent_42%)]" />

              <div className="relative flex h-full flex-col">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white shadow-soft">
                    <BenefitIcon type={benefit.icon} />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-semibold tracking-[-0.04em] text-neutral-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-neutral-600 md:text-[15px]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
