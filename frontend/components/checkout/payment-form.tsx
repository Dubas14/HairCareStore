'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { CreditCard, Banknote, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StripePaymentForm } from './stripe-payment-form'
import { getStripe } from '@/lib/stripe-client'
import { createPaymentIntent } from '@/lib/payload/payment-actions'
import { cn } from '@/lib/utils'
import type { CurrencyCode } from '@/lib/payload/types'

type PaymentMethod = 'cod' | 'stripe'

interface PaymentFormData {
  method: PaymentMethod
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void
  onStripeSuccess: (paymentIntentId: string) => void
  onBack: () => void
  isProcessing?: boolean
  total?: number
  cartId?: number | string
  currency?: CurrencyCode
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  UAH: '₴',
  EUR: '€',
  PLN: 'zł',
  USD: '$',
}

const paymentMethods = [
  {
    id: 'stripe' as const,
    name: 'Онлайн оплата',
    description: 'Visa, Mastercard, Apple Pay, Google Pay',
    icon: CreditCard,
  },
  {
    id: 'cod' as const,
    name: 'Накладений платіж',
    description: 'Оплата при отриманні на пошті',
    icon: Banknote,
  },
]

export function PaymentForm({
  onSubmit,
  onStripeSuccess,
  onBack,
  isProcessing: externalProcessing,
  total,
  cartId,
  currency = 'UAH',
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [isLoadingStripe, setIsLoadingStripe] = useState(false)

  const currencySymbol = CURRENCY_SYMBOLS[currency] || '₴'
  const stripePromise = getStripe()
  const hasStripeKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  // Initialize Stripe PaymentIntent when stripe method is selected
  const initializeStripe = useCallback(async () => {
    if (!cartId || !hasStripeKey) return
    setIsLoadingStripe(true)
    setStripeError(null)

    try {
      const { clientSecret } = await createPaymentIntent(cartId)
      setStripeClientSecret(clientSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не вдалося ініціалізувати оплату'
      setStripeError(message)
      // Fallback to COD
      setSelectedMethod('cod')
    } finally {
      setIsLoadingStripe(false)
    }
  }, [cartId, hasStripeKey])

  useEffect(() => {
    if (selectedMethod === 'stripe' && !stripeClientSecret && hasStripeKey) {
      initializeStripe()
    }
  }, [selectedMethod, stripeClientSecret, hasStripeKey, initializeStripe])

  const handleMethodChange = (method: PaymentMethod) => {
    if (method === 'stripe' && !hasStripeKey) return
    setSelectedMethod(method)
  }

  // Handle COD submit
  const handleCodSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedToTerms) {
      setTermsError(true)
      return
    }
    onSubmit({ method: 'cod' })
  }

  // Handle Stripe payment success
  const handleStripeSuccess = (paymentIntentId: string) => {
    if (!agreedToTerms) {
      setTermsError(true)
      setIsProcessing(false)
      return
    }
    onStripeSuccess(paymentIntentId)
  }

  const handleStripeError = (message: string) => {
    setStripeError(message)
    setIsProcessing(false)
  }

  const processing = isProcessing || externalProcessing

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Спосіб оплати</h2>

      {/* Payment Methods */}
      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const isSelected = selectedMethod === method.id
          const isDisabled = method.id === 'stripe' && !hasStripeKey

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

      {/* Error message */}
      {stripeError && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-card p-3 text-sm text-destructive">
          {stripeError}
        </div>
      )}

      {/* Stripe Payment Form */}
      {selectedMethod === 'stripe' && hasStripeKey && (
        <>
          {isLoadingStripe ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Підготовка оплати...</span>
            </div>
          ) : stripeClientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: stripeClientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#1A1A1A',
                    colorBackground: '#FFFFFF',
                    colorText: '#1A1A1A',
                    colorDanger: '#BC4749',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '12px',
                  },
                },
                locale: 'auto',
              }}
            >
              {/* Terms agreement — above payment button */}
              <div className="space-y-1 mb-4">
                <label className="flex items-start gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked)
                      if (e.target.checked) setTermsError(false)
                    }}
                    className="mt-1 w-4 h-4 rounded border-border accent-primary"
                  />
                  <span className="text-muted-foreground">
                    Я погоджуюсь з{' '}
                    <Link href="/pages/delivery" className="text-primary hover:underline">
                      умовами доставки
                    </Link>
                    {' '}та{' '}
                    <Link href="/pages/payment" className="text-primary hover:underline">
                      оплати
                    </Link>
                  </span>
                </label>
                {termsError && (
                  <p className="text-sm text-destructive ml-7" role="alert">
                    Необхідно погодитись з умовами
                  </p>
                )}
              </div>

              <StripePaymentForm
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                total={total || 0}
                currencySymbol={currencySymbol}
                isProcessing={processing || false}
                setIsProcessing={setIsProcessing}
              />
            </Elements>
          ) : null}

          {/* Back button for Stripe */}
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full h-12"
            disabled={processing}
          >
            Назад
          </Button>
        </>
      )}

      {/* COD Payment Form */}
      {selectedMethod === 'cod' && (
        <form onSubmit={handleCodSubmit} className="space-y-6">
          {/* COD info */}
          <div className="bg-muted/50 rounded-card p-4">
            <p className="text-sm text-muted-foreground">
              Оплата готівкою або карткою при отриманні у відділенні Нової Пошти.
              Комісія за накладений платіж: 20 ₴ + 2% від суми замовлення.
            </p>
          </div>

          {/* Total */}
          {total !== undefined && (
            <div className="bg-primary/5 rounded-card p-4 flex justify-between items-center">
              <span className="font-medium">До сплати:</span>
              <span className="text-xl font-bold">{Math.round(total)} {currencySymbol}</span>
            </div>
          )}

          {/* Security */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Ваші дані захищені SSL шифруванням</span>
          </div>

          {/* Terms agreement */}
          <div className="space-y-1">
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked)
                  if (e.target.checked) setTermsError(false)
                }}
                className="mt-1 w-4 h-4 rounded border-border accent-primary"
              />
              <span className="text-muted-foreground">
                Я погоджуюсь з{' '}
                <Link href="/pages/delivery" className="text-primary hover:underline">
                  умовами доставки
                </Link>
                {' '}та{' '}
                <Link href="/pages/payment" className="text-primary hover:underline">
                  оплати
                </Link>
              </span>
            </label>
            {termsError && (
              <p className="text-sm text-destructive ml-7" role="alert">
                Необхідно погодитись з умовами
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-12"
              disabled={processing}
            >
              Назад
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-button"
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
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
      )}
    </div>
  )
}
