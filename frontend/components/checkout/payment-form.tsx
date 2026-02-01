'use client'

import { useState } from 'react'
import { CreditCard, Banknote, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaymentMethod = 'cod' | 'online'

interface PaymentFormData {
  method: PaymentMethod
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void
  onBack: () => void
  isProcessing?: boolean
  total?: number
}

const paymentMethods = [
  {
    id: 'cod' as const,
    name: 'Накладений платіж',
    description: 'Оплата при отриманні на пошті',
    icon: Banknote,
  },
  {
    id: 'online' as const,
    name: 'Онлайн оплата',
    description: 'Visa, Mastercard (скоро)',
    icon: CreditCard,
    disabled: true,
  },
]

export function PaymentForm({ onSubmit, onBack, isProcessing, total }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    method: 'cod',
  })

  const handleMethodChange = (method: PaymentMethod) => {
    if (method === 'online') return // Disabled for now
    setFormData((prev) => ({ ...prev, method }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Спосіб оплати</h2>

      {/* Payment Methods */}
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = formData.method === method.id
          const isDisabled = method.disabled

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodChange(method.id)}
              disabled={isDisabled}
              className={cn(
                "flex items-center gap-4 w-full p-4 rounded-card border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50",
                isDisabled && "opacity-50 cursor-not-allowed hover:border-border"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="font-medium block">
                  {method.name}
                  {isDisabled && (
                    <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                      Скоро
                    </span>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">{method.description}</span>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-full border-2",
                isSelected ? "border-primary bg-primary" : "border-muted-foreground"
              )}>
                {isSelected && <span className="block w-full h-full bg-white rounded-full scale-50" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* COD info */}
      {formData.method === 'cod' && (
        <div className="bg-muted/50 rounded-card p-4">
          <p className="text-sm text-muted-foreground">
            Оплата готівкою або карткою при отриманні у відділенні Нової Пошти.
            Комісія за накладений платіж: 20 ₴ + 2% від суми замовлення.
          </p>
        </div>
      )}

      {/* Online info */}
      {formData.method === 'online' && (
        <div className="bg-muted/50 rounded-card p-4 text-center">
          <p className="text-muted-foreground">
            Онлайн оплата буде доступна незабаром
          </p>
        </div>
      )}

      {/* Total */}
      {total !== undefined && (
        <div className="bg-primary/5 rounded-card p-4 flex justify-between items-center">
          <span className="font-medium">До сплати:</span>
          <span className="text-xl font-bold">{Math.round(total)} ₴</span>
        </div>
      )}

      {/* Security */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Ваші дані захищені SSL шифруванням</span>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
          disabled={isProcessing}
        >
          Назад
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-button"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Обробка...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Підтвердити замовлення
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
