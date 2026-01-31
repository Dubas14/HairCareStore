'use client'

import { useInView } from 'react-intersection-observer'

// SVG іконки в стилі бренду
const BenefitIcon = ({ type }: { type: 'quiz' | 'original' | 'delivery' | 'bonus' }) => {
  const iconClass = "w-8 h-8 text-[#2A9D8F]"

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
    description: 'Допоможемо обрати ідеальні продукти'
  },
  {
    id: 2,
    icon: 'original' as const,
    title: '100% оригінал',
    description: 'Офіційний дистриб\'ютор брендів'
  },
  {
    id: 3,
    icon: 'delivery' as const,
    title: 'Швидка доставка',
    description: 'Нова Пошта по всій Україні'
  },
  {
    id: 4,
    icon: 'bonus' as const,
    title: 'Бонусна програма',
    description: 'Накопичуйте бали та знижки'
  }
]

export function BenefitsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section className="py-10 bg-white border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className={`flex items-start gap-3 ${
                inView ? 'animate-fadeInScale' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center">
                <BenefitIcon type={benefit.icon} />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-0.5">
                  {benefit.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
