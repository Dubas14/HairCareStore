'use client'

import { useState } from 'react'
import { CreditCard, Smartphone, Banknote, Lock, ShieldCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PaymentMethod = 'card' | 'liqpay' | 'cash'

interface PaymentFormData {
  method: PaymentMethod
  cardNumber?: string
  cardExpiry?: string
  cardCvc?: string
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void
  onBack: () => void
  isProcessing?: boolean
}

const paymentMethods = [
  {
    id: 'card' as const,
    name: 'Карткою онлайн',
    description: 'Visa, Mastercard',
    icon: CreditCard,
  },
  {
    id: 'liqpay' as const,
    name: 'LiqPay',
    description: 'Apple Pay, Google Pay',
    icon: Smartphone,
  },
  {
    id: 'cash' as const,
    name: 'Готівкою',
    description: 'При отриманні',
    icon: Banknote,
  },
]

export function PaymentForm({ onSubmit, onBack, isProcessing }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    method: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  })

  const handleMethodChange = (method: PaymentMethod) => {
    setFormData((prev) => ({ ...prev, method }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
      setFormData((prev) => ({ ...prev, cardNumber: formatted }))
      return
    }

    // Format expiry
    if (name === 'cardExpiry') {
      let formatted = value.replace(/\D/g, '').slice(0, 4)
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2)
      }
      setFormData((prev) => ({ ...prev, cardExpiry: formatted }))
      return
    }

    // Format CVC
    if (name === 'cardCvc') {
      const formatted = value.replace(/\D/g, '').slice(0, 3)
      setFormData((prev) => ({ ...prev, cardCvc: formatted }))
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
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

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodChange(method.id)}
              className={cn(
                "flex items-center gap-4 w-full p-4 rounded-card border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="font-medium block">{method.name}</span>
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

      {/* Card Details */}
      {formData.method === 'card' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-card">
          <div className="space-y-2">
            <label htmlFor="cardNumber" className="text-sm font-medium">
              Номер картки
            </label>
            <Input
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="0000 0000 0000 0000"
              className="font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="cardExpiry" className="text-sm font-medium">
                Термін дії
              </label>
              <Input
                id="cardExpiry"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleChange}
                placeholder="MM/YY"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cardCvc" className="text-sm font-medium">
                CVV
              </label>
              <Input
                id="cardCvc"
                name="cardCvc"
                type="password"
                value={formData.cardCvc}
                onChange={handleChange}
                placeholder="***"
                className="font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* LiqPay info */}
      {formData.method === 'liqpay' && (
        <div className="bg-muted/50 rounded-card p-4 text-center">
          <p className="text-muted-foreground">
            Ви будете перенаправлені на сторінку LiqPay для завершення оплати
          </p>
        </div>
      )}

      {/* Cash info */}
      {formData.method === 'cash' && (
        <div className="bg-muted/50 rounded-card p-4">
          <p className="text-muted-foreground">
            Оплата готівкою при отриманні замовлення. Можлива оплата карткою кур&apos;єру.
          </p>
        </div>
      )}

      {/* Security */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Ваші дані захищені SSL шифруванням</span>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12" disabled={isProcessing}>
          Назад
        </Button>
        <Button type="submit" className="flex-1 h-12 rounded-button" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <span className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Обробка...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 mr-2" />
              Оплатити
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
