'use client'

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

export type CheckoutStep = 'cart' | 'contact' | 'shipping' | 'payment'

interface CheckoutStepsProps {
  currentStep: CheckoutStep
}

const steps: { id: CheckoutStep; label: string; caption: string }[] = [
  { id: 'cart', label: 'Кошик', caption: 'Товари готові' },
  { id: 'contact', label: 'Контакти', caption: 'Дані отримувача' },
  { id: 'shipping', label: 'Доставка', caption: 'Місто та відділення' },
  { id: 'payment', label: 'Оплата', caption: 'Підтвердження замовлення' },
]

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!navRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      // Animate step cards entrance
      gsap.fromTo(
        '[data-checkout-step]',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', clearProps: 'all' },
      )

      // Animate connector lines fill
      gsap.fromTo(
        '[data-step-connector]',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power2.out' },
      )
    }, navRef)

    return () => ctx.revert()
  }, [currentStep])

  return (
    <nav ref={navRef} aria-label="Етапи оформлення" className="mb-8">
      <ol className="grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = step.id === currentStep

          return (
            <li key={step.id} className="relative" data-checkout-step>
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[calc(50%+1.75rem)] top-7 hidden h-px w-[calc(100%-2rem)] bg-border md:block"
                >
                  <span
                    data-step-connector
                    className={cn(
                      'absolute inset-0 origin-left bg-foreground/70',
                      index < currentIndex ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </span>
              )}

              <div
                className={cn(
                  'relative flex items-center gap-4 rounded-[1.75rem] border px-4 py-4 transition-colors',
                  isCurrent
                    ? 'border-foreground bg-[linear-gradient(135deg,rgba(245,238,228,0.95),rgba(255,255,255,0.98))] shadow-[0_24px_60px_rgba(16,24,40,0.08)]'
                    : isCompleted
                    ? 'border-foreground/15 bg-white shadow-[0_14px_34px_rgba(16,24,40,0.06)]'
                    : 'border-border bg-white/70'
                )}
              >
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-all',
                    isCompleted
                      ? 'bg-foreground text-background'
                      : isCurrent
                      ? 'bg-[#1f2a20] text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent || isCompleted ? 'text-foreground' : 'text-foreground/72'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {step.caption}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
