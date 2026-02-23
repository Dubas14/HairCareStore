'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Package, AlertCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CheckoutSteps,
  CheckoutStep,
  OrderSummary,
  ContactForm,
  ShippingForm,
  PaymentForm,
} from '@/components/checkout'
import { PromoCodeInput } from '@/components/checkout/promo-code-input'
import { useCartContext } from '@/components/providers/cart-provider'
import { useCartStore } from '@/stores/cart-store'
import { useCustomer } from '@/lib/hooks/use-customer'
import { useAddresses } from '@/lib/hooks/use-addresses'
import {
  updateCartAddresses,
  setCartShippingMethod,
  getShippingOptions,
  completeCart,
  linkCartToCustomer,
  clearCartAfterPayment,
} from '@/lib/payload/cart-actions'
import { completeStripePayment } from '@/lib/payload/payment-actions'
import {
  trackBeginCheckout,
  trackAddShippingInfo,
  trackAddPaymentInfo,
  trackPurchase,
} from '@/lib/analytics/events'
import type { CartItem } from '@/lib/payload/types'

interface ContactData {
  email: string
  phone: string
  firstName: string
  lastName: string
}

interface ShippingData {
  city: string
  warehouse: string
  shippingMethodId: string
}

interface PaymentData {
  method: 'cod' | 'online' | 'stripe'
}

interface CheckoutData {
  contact: ContactData | null
  shipping: ShippingData | null
  payment: PaymentData | null
}

interface CompletedOrder {
  orderId: number | string
  displayId: number
  email: string
  total: number
}

export default function CheckoutPage() {
  const { cart, isLoading: isCartLoading, refreshCart, clearCart } = useCartContext()
  const clearCartStorage = useCartStore((s) => s.clearCart)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact')
  const [isComplete, setIsComplete] = useState(false)
  const [order, setOrder] = useState<CompletedOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    contact: null,
    shipping: null,
    payment: null,
  })

  // Promo code state
  const [promoCode, setPromoCode] = useState<string | undefined>(cart?.promoCode || undefined)
  const [promoDiscount, setPromoDiscount] = useState<number>(cart?.promoDiscount || 0)

  // Customer & addresses for autofill
  const { customer, isAuthenticated } = useCustomer()
  const { addresses, defaultAddress } = useAddresses()

  // Shipping options loaded from Payload global config
  const [shippingOptions, setShippingOptions] = useState<
    Array<{ methodId: string; name: string; price: number; freeAbove?: number }>
  >([])

  // Load shipping options on mount
  useEffect(() => {
    getShippingOptions()
      .then(setShippingOptions)
      .catch(() =>
        setShippingOptions([
          { methodId: 'nova-poshta', name: 'Нова Пошта', price: 70, freeAbove: 1000 },
        ])
      )
  }, [])

  // Link authenticated customer to the cart
  useEffect(() => {
    if (customer?.id) {
      linkCartToCustomer(customer.id).catch(() => {})
    }
  }, [customer?.id])

  // Auto-populate contact data from customer profile
  useEffect(() => {
    if (!customer) return

    setCheckoutData((prev) => {
      // Only update if we don't have contact data yet
      if (prev.contact) return prev

      return {
        ...prev,
        contact: {
          email: customer.email,
          phone: customer.phone || '',
          firstName: customer.firstName || '',
          lastName: customer.lastName || '',
        },
      }
    })
  }, [customer])

  // Update phone from default address if customer phone is empty
  useEffect(() => {
    if (!defaultAddress?.phone) return

    setCheckoutData((prev) => {
      // Only update if contact exists but phone is empty
      if (!prev.contact || prev.contact.phone) return prev

      return {
        ...prev,
        contact: {
          ...prev.contact,
          phone: defaultAddress.phone || '',
        },
      }
    })
  }, [defaultAddress])

  // Auto-populate shipping data from default address
  useEffect(() => {
    if (!defaultAddress) return

    setCheckoutData((prev) => {
      // Only update if we don't have shipping data yet
      if (prev.shipping) return prev

      return {
        ...prev,
        shipping: {
          city: defaultAddress.city || '',
          warehouse: defaultAddress.address1 || '',
          shippingMethodId: '',
        },
      }
    })
  }, [defaultAddress])

  const items = cart?.items || []

  const analyticsItems = items.map((item: CartItem) => ({
    item_id: String(typeof item.product === 'object' ? (item.product as { id: number | string }).id : item.product),
    item_name: item.productTitle || 'Product',
    price: item.unitPrice,
    quantity: item.quantity,
  }))

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
            Ваше замовлення #{order.displayId} успішно оформлено
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
    setIsProcessing(true)

    try {
      const addressData = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        city: 'Україна',
        address1: 'Нова Пошта',
        countryCode: 'ua',
        postalCode: '00000',
      }

      await updateCartAddresses({
        email: data.email,
        shippingAddress: addressData,
        billingAddress: addressData,
      })

      await refreshCart()
      setCheckoutData((prev) => ({ ...prev, contact: data }))
      trackBeginCheckout(analyticsItems, cart.total)
      setCurrentStep('shipping')
    } catch (err) {
      setError('Не вдалося зберегти контактну інформацію. Спробуйте ще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle shipping form submit
  const handleShippingSubmit = async (data: ShippingData) => {
    if (!cart) return
    setError(null)
    setIsProcessing(true)

    try {
      // Update address with city and warehouse
      const addressData = {
        firstName: checkoutData.contact?.firstName || '',
        lastName: checkoutData.contact?.lastName || '',
        phone: checkoutData.contact?.phone,
        city: data.city,
        address1: `НП: ${data.warehouse}`,
        countryCode: 'ua',
        postalCode: '00000',
      }

      await updateCartAddresses({
        shippingAddress: addressData,
        billingAddress: addressData,
      })

      // Set shipping method based on user selection
      const selectedOption = shippingOptions.find(
        (opt) => opt.methodId === data.shippingMethodId
      )
      if (selectedOption) {
        await setCartShippingMethod(selectedOption.methodId, selectedOption.price)
      } else if (shippingOptions.length > 0) {
        // Fallback to first option if somehow none matched
        await setCartShippingMethod(
          shippingOptions[0].methodId,
          shippingOptions[0].price
        )
      }

      await refreshCart()
      setCheckoutData((prev) => ({ ...prev, shipping: data }))
      trackAddShippingInfo(analyticsItems, data.shippingMethodId, cart.total)
      setCurrentStep('payment')
    } catch (err) {
      setError('Не вдалося зберегти інформацію про доставку. Спробуйте ще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle COD payment submit
  const handlePaymentSubmit = async (data: PaymentData) => {
    if (!cart) return
    setError(null)
    setIsProcessing(true)

    try {
      setCheckoutData((prev) => ({ ...prev, payment: data }))
      trackAddPaymentInfo(analyticsItems, data.method, cart.total)

      // Complete the cart and place order (COD - no payment session needed)
      const result = await completeCart()

      trackPurchase(
        String(result.displayId),
        analyticsItems,
        cart.total,
        cart.shippingTotal || 0,
      )

      setOrder({
        orderId: result.orderId,
        displayId: result.displayId,
        email: checkoutData.contact?.email || cart.email || '',
        total: cart.total,
      })

      // Clear cart state after successful order
      clearCart()
      clearCartStorage()

      setIsComplete(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не вдалося оформити замовлення.'
      setError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Stripe payment success
  const handleStripeSuccess = async (paymentIntentId: string) => {
    if (!cart) return
    setError(null)
    setIsProcessing(true)

    try {
      const result = await completeStripePayment(cart.id, paymentIntentId)

      setCheckoutData((prev) => ({ ...prev, payment: { method: 'online' } }))

      setOrder({
        orderId: result.orderId,
        displayId: result.displayId,
        email: checkoutData.contact?.email || cart.email || '',
        total: cart.total,
      })

      // Clear cart state
      clearCart()
      clearCartStorage()
      await clearCartAfterPayment()

      setIsComplete(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Помилка при завершенні замовлення.'
      setError(message)
      console.error('Stripe completion error:', err)
    } finally {
      setIsProcessing(false)
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
                  addresses={addresses}
                  isAuthenticated={isAuthenticated}
                  shippingOptions={shippingOptions}
                />
              )}

              {currentStep === 'payment' && (
                <PaymentForm
                  onSubmit={handlePaymentSubmit}
                  onStripeSuccess={handleStripeSuccess}
                  onBack={() => setCurrentStep('shipping')}
                  isProcessing={isProcessing}
                  total={cart ? cart.total : 0}
                  cartId={cart?.id}
                  currency={cart?.currency || 'UAH'}
                />
              )}
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Безпечна оплата</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span>Швидка доставка</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>Повернення 14 днів</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              <OrderSummary cart={cart} />
              {cart && (
                <div className="bg-card rounded-card p-4 shadow-soft">
                  <PromoCodeInput
                    cartId={cart.id}
                    email={checkoutData.contact?.email || cart.email}
                    appliedCode={promoCode}
                    appliedDiscount={promoDiscount}
                    currency={cart.currency || 'UAH'}
                    onApplied={(code, discount) => {
                      setPromoCode(code)
                      setPromoDiscount(discount)
                      refreshCart()
                    }}
                    onRemoved={() => {
                      setPromoCode(undefined)
                      setPromoDiscount(0)
                      refreshCart()
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
