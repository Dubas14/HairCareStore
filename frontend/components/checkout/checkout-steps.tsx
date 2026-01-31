'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CheckoutStep = 'cart' | 'contact' | 'shipping' | 'payment'

interface CheckoutStepsProps {
  currentStep: CheckoutStep
}

const steps: { id: CheckoutStep; label: string }[] = [
  { id: 'cart', label: 'Кошик' },
  { id: 'contact', label: 'Контакти' },
  { id: 'shipping', label: 'Доставка' },
  { id: 'payment', label: 'Оплата' },
]

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <nav aria-label="Етапи оформлення" className="mb-8">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = step.id === currentStep

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted
                      ? "bg-success text-success-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-4",
                    index < currentIndex ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
