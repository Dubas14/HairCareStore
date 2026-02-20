'use client'

import { useState, useEffect } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Loader2 } from 'lucide-react'

interface StripePaymentFormProps {
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
  total: number
  currencySymbol: string
  isProcessing: boolean
  setIsProcessing: (v: boolean) => void
}

export function StripePaymentForm({
  onSuccess,
  onError,
  total,
  currencySymbol,
  isProcessing,
  setIsProcessing,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isReady, setIsReady] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      onError('Stripe ще не завантажено. Зачекайте.')
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required',
      })

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          onError(error.message || 'Помилка оплати')
        } else {
          onError('Сталася помилка при обробці оплати. Спробуйте ще раз.')
        }
        setIsProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id)
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3D Secure or other authentication — Stripe handles this automatically
        onError('Потрібна додаткова автентифікація. Слідуйте інструкціям банку.')
        setIsProcessing(false)
      } else {
        onError('Невідомий статус оплати. Спробуйте ще раз.')
        setIsProcessing(false)
      }
    } catch (err) {
      onError('Сталася помилка при обробці оплати.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-card rounded-card border p-4">
        <PaymentElement
          onReady={() => setIsReady(true)}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Total */}
      <div className="bg-primary/5 rounded-card p-4 flex justify-between items-center">
        <span className="font-medium">До сплати:</span>
        <span className="text-xl font-bold">{Math.round(total)} {currencySymbol}</span>
      </div>

      {/* Security */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-success" />
        <span>Оплата захищена SSL-шифруванням через Stripe</span>
      </div>

      <Button
        type="submit"
        className="w-full h-12 rounded-button"
        disabled={!stripe || !elements || !isReady || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Обробка оплати...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5 mr-2" />
            Оплатити {Math.round(total)} {currencySymbol}
          </>
        )}
      </Button>
    </form>
  )
}
