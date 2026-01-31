'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CheckoutSteps,
  CheckoutStep,
  OrderSummary,
  ContactForm,
  ShippingForm,
  PaymentForm,
} from '@/components/checkout'
import { useCartContext } from '@/components/providers/cart-provider'
import {
  useUpdateCart,
  useShippingOptions,
  useAddShippingMethod,
  useInitiatePaymentSession,
  useCompleteCart,
  type MedusaOrder,
} from '@/lib/medusa/hooks'

interface ContactData {
  email: string
  phone: string
  firstName: string
  lastName: string
}

interface ShippingData {
  city: string
  warehouse: string
}

interface PaymentData {
  method: 'cod' | 'online'
}

interface CheckoutData {
  contact: ContactData | null
  shipping: ShippingData | null
  payment: PaymentData | null
}

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading } = useCartContext()
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact')
  const [isComplete, setIsComplete] = useState(false)
  const [order, setOrder] = useState<MedusaOrder | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: null,
    shipping: null,
    payment: null,
  })

  // Hooks
  const updateCartMutation = useUpdateCart()
  const { data: shippingOptions } = useShippingOptions(cart?.id)
  const addShippingMethodMutation = useAddShippingMethod()
  const initiatePaymentSessionMutation = useInitiatePaymentSession()
  const completeCartMutation = useCompleteCart()

  const items = cart?.items || []
  const isProcessing =
    updateCartMutation.isPending ||
    addShippingMethodMutation.isPending ||
    initiatePaymentSessionMutation.isPending ||
    completeCartMutation.isPending

  // Loading state
  if (isCartLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Завантаження...</p>
        </div>
      </main>
    )
  }

  // Empty cart
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

  // Order Complete
  if (isComplete && order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <div className="bg-success/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Дякуємо за замовлення!</h1>
          <p className="text-muted-foreground mb-4">
            Ваше замовлення #{order.display_id} успішно оформлено
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Ми надіслали деталі замовлення на {order.email}.
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
                <span className="text-muted-foreground">Місто</span>
                <span>{checkoutData.shipping?.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Відділення НП</span>
                <span>{checkoutData.shipping?.warehouse}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Оплата</span>
                <span>
                  {checkoutData.payment?.method === 'cod'
                    ? 'Накладений платіж'
                    : 'Онлайн оплата'}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-2 border-t">
                <span>Сума</span>
                <span>{Math.round(order.total)} ₴</span>
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

  // Handle contact form submit
  const handleContactSubmit = async (data: ContactData) => {
    if (!cart) return
    setError(null)

    try {
      await updateCartMutation.mutateAsync({
        cartId: cart.id,
        data: {
          email: data.email,
          shipping_address: {
            first_name: data.firstName,
            last_name: data.lastName,
            address_1: 'Нова Пошта', // Will be updated in shipping step
            city: 'Україна',
            postal_code: '00000',
            country_code: 'ua',
            phone: data.phone,
          },
          billing_address: {
            first_name: data.firstName,
            last_name: data.lastName,
            address_1: 'Нова Пошта',
            city: 'Україна',
            postal_code: '00000',
            country_code: 'ua',
            phone: data.phone,
          },
        },
      })

      setCheckoutData((prev) => ({ ...prev, contact: data }))
      setCurrentStep('shipping')
    } catch (err) {
      setError('Не вдалося зберегти контактну інформацію. Спробуйте ще раз.')
      console.error('Contact submit error:', err)
    }
  }

  // Handle shipping form submit
  const handleShippingSubmit = async (data: ShippingData) => {
    if (!cart) return
    setError(null)

    try {
      // Update address with city and warehouse
      await updateCartMutation.mutateAsync({
        cartId: cart.id,
        data: {
          shipping_address: {
            first_name: checkoutData.contact?.firstName || '',
            last_name: checkoutData.contact?.lastName || '',
            address_1: `НП: ${data.warehouse}`,
            city: data.city,
            postal_code: '00000',
            country_code: 'ua',
            phone: checkoutData.contact?.phone,
          },
          billing_address: {
            first_name: checkoutData.contact?.firstName || '',
            last_name: checkoutData.contact?.lastName || '',
            address_1: `НП: ${data.warehouse}`,
            city: data.city,
            postal_code: '00000',
            country_code: 'ua',
            phone: checkoutData.contact?.phone,
          },
        },
      })

      // Add shipping method (use first available option - Nova Poshta)
      if (shippingOptions && shippingOptions.length > 0) {
        await addShippingMethodMutation.mutateAsync({
          cartId: cart.id,
          optionId: shippingOptions[0].id,
        })
      }

      setCheckoutData((prev) => ({ ...prev, shipping: data }))
      setCurrentStep('payment')
    } catch (err) {
      setError('Не вдалося зберегти інформацію про доставку. Спробуйте ще раз.')
      console.error('Shipping submit error:', err)
    }
  }

  // Handle payment form submit
  const handlePaymentSubmit = async (data: PaymentData) => {
    if (!cart) return
    setError(null)

    try {
      setCheckoutData((prev) => ({ ...prev, payment: data }))

      // Initialize payment session with system provider (COD)
      // This also creates payment collection automatically
      // pp_system_default is the default payment provider for cash on delivery
      await initiatePaymentSessionMutation.mutateAsync({
        cart,
        providerId: 'pp_system_default',
      })

      // Complete the cart and place order
      const result = await completeCartMutation.mutateAsync(cart.id)

      if (result.type === 'order' && result.order) {
        setOrder(result.order)
        setIsComplete(true)
      } else {
        setError(result.error?.message || 'Не вдалося оформити замовлення')
      }
    } catch (err) {
      setError('Не вдалося оформити замовлення. Спробуйте ще раз.')
      console.error('Payment submit error:', err)
    }
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

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-card flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

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
                  isLoading={isProcessing}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  onBack={() => setCurrentStep('shipping')}
                  isProcessing={isProcessing}
                  total={cart ? cart.total : 0}
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <OrderSummary cart={cart} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
