'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CheckoutSteps,
  CheckoutStep,
  OrderSummary,
  ContactForm,
  ShippingForm,
  PaymentForm,
} from '@/components/checkout'
import { useCartStore } from '@/stores/cart-store'

type DeliveryMethod = 'courier' | 'nova-poshta' | 'pickup'
type PaymentMethod = 'card' | 'liqpay' | 'cash'

interface CheckoutData {
  contact: {
    email: string
    phone: string
    firstName: string
    lastName: string
  } | null
  shipping: {
    method: DeliveryMethod
    city: string
    address: string
    warehouse?: string
  } | null
  payment: {
    method: PaymentMethod
  } | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getSubtotal, clearCart } = useCartStore()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: null,
    shipping: null,
    payment: null,
  })

  // Redirect if cart is empty (unless order is complete)
  if (items.length === 0 && !isComplete) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Кошик порожній</h1>
          <p className="text-muted-foreground mb-6">
            Додайте товари, щоб оформити замовлення
          </p>
          <Button asChild>
            <Link href="/shop">Перейти до каталогу</Link>
          </Button>
        </div>
      </main>
    )
  }

  // Order Complete View
  if (isComplete && orderId) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="bg-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Дякуємо за замовлення!</h1>
          <p className="text-muted-foreground mb-4">
            Ваше замовлення #{orderId} успішно оформлено
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Ми надіслали деталі замовлення на вашу електронну пошту.
            Очікуйте дзвінок від менеджера для підтвердження.
          </p>

          <div className="bg-muted/50 rounded-card p-6 text-left mb-8">
            <h3 className="font-semibold mb-4">Деталі замовлення</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Отримувач</span>
                <span>
                  {checkoutData.contact?.firstName} {checkoutData.contact?.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Телефон</span>
                <span>{checkoutData.contact?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span>
                  {checkoutData.shipping?.method === 'courier'
                    ? "Кур'єр"
                    : checkoutData.shipping?.method === 'nova-poshta'
                    ? 'Нова Пошта'
                    : 'Самовивіз'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Оплата</span>
                <span>
                  {checkoutData.payment?.method === 'card'
                    ? 'Карткою онлайн'
                    : checkoutData.payment?.method === 'liqpay'
                    ? 'LiqPay'
                    : 'Готівкою'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/shop">Продовжити покупки</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">На головну</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const handleContactSubmit = (data: CheckoutData['contact']) => {
    setCheckoutData((prev) => ({ ...prev, contact: data }))
    setCurrentStep('shipping')
  }

  const handleShippingSubmit = (data: CheckoutData['shipping']) => {
    setCheckoutData((prev) => ({ ...prev, shipping: data }))
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = async (data: CheckoutData['payment']) => {
    setCheckoutData((prev) => ({ ...prev, payment: data }))
    setIsProcessing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate order ID
    const newOrderId = `HL-${Date.now().toString(36).toUpperCase()}`
    setOrderId(newOrderId)

    // Clear cart
    clearCart()

    setIsProcessing(false)
    setIsComplete(true)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Повернутися до покупок
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Оформлення замовлення
        </h1>

        {/* Steps */}
        <div className="max-w-2xl mx-auto">
          <CheckoutSteps currentStep={currentStep} />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Forms */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-card p-6 shadow-soft">
              {currentStep === 'contact' && (
                <ContactForm
                  onSubmit={handleContactSubmit}
                  initialData={checkoutData.contact || undefined}
                />
              )}

              {currentStep === 'shipping' && (
                <ShippingForm
                  onSubmit={handleShippingSubmit}
                  onBack={() => setCurrentStep('contact')}
                  initialData={checkoutData.shipping || undefined}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  onBack={() => setCurrentStep('shipping')}
                  isProcessing={isProcessing}
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <OrderSummary />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
