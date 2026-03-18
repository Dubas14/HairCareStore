'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  Package,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CheckoutSteps,
  type CheckoutStep,
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
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

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
  cityRef?: string
  warehouseRef?: string
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

const checkoutHighlights = [
  {
    icon: ShieldCheck,
    title: 'Безпечна оплата',
    description: 'Мінімум полів, зрозумілі кроки та захищені платіжні дані.',
  },
  {
    icon: Truck,
    title: 'Швидка доставка',
    description: 'Flow оптимізований під Нову Пошту та сценарій замовлення зі смартфона.',
  },
  {
    icon: RotateCcw,
    title: 'Повернення 14 днів',
    description: 'Прозора підсумкова сума та зрозумілі правила повернення.',
  },
]

export default function CheckoutPage() {
  const heroRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<HTMLDivElement | null>(null)
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

  const [promoCode, setPromoCode] = useState<string | undefined>(cart?.promoCode || undefined)
  const [promoDiscount, setPromoDiscount] = useState<number>(cart?.promoDiscount || 0)

  const { customer, isAuthenticated } = useCustomer()
  const { addresses, defaultAddress } = useAddresses()

  const [shippingOptions, setShippingOptions] = useState<
    Array<{ methodId: string; name: string; price: number; freeAbove?: number }>
  >([])

  useEffect(() => {
    getShippingOptions()
      .then(setShippingOptions)
      .catch(() =>
        setShippingOptions([
          { methodId: 'nova-poshta', name: 'Нова Пошта', price: 70, freeAbove: 1000 },
        ])
      )
  }, [])

  useEffect(() => {
    if (customer?.id) {
      linkCartToCustomer(customer.id).catch(() => {})
    }
  }, [customer?.id])

  useEffect(() => {
    if (!heroRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-checkout-hero-badge], [data-checkout-hero-title], [data-checkout-hero-copy], [data-checkout-hero-stats], [data-checkout-hero-note]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.08,
        }
      )

      gsap.fromTo(
        '[data-checkout-orb]',
        { y: 0, x: 0 },
        {
          y: (index: number) => (index % 2 === 0 ? 18 : -16),
          x: (index: number) => (index % 2 === 0 ? -10 : 12),
          duration: 4.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.2,
        }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!stageRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const panel = stageRef.current.querySelector('[data-checkout-panel]')
    const summary = stageRef.current.querySelector('[data-checkout-summary]')
    const trust = stageRef.current.querySelector('[data-checkout-trust]')

    gsap.fromTo(
      [panel, summary, trust].filter(Boolean),
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.72,
        ease: 'power2.out',
        stagger: 0.08,
        clearProps: 'transform',
      }
    )
  }, [currentStep, cart?.id, isComplete])

  useEffect(() => {
    if (!customer) return

    setCheckoutData((prev) => {
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

  useEffect(() => {
    if (!defaultAddress?.phone) return

    setCheckoutData((prev) => {
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

  useEffect(() => {
    if (!defaultAddress) return

    setCheckoutData((prev) => {
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
    item_id: String(
      typeof item.product === 'object'
        ? (item.product as { id: number | string }).id
        : item.product
    ),
    item_name: item.productTitle || 'Product',
    price: item.unitPrice,
    quantity: item.quantity,
  }))

  if (isCartLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Завантаження...</p>
        </div>
      </main>
    )
  }

  if (items.length === 0 && !isComplete) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f6efe5_0%,#fbf7f2_36%,#ffffff_100%)]">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_24px_60px_rgba(16,24,40,0.08)]">
            <Package className="h-9 w-9 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Кошик порожній</h1>
          <p className="mb-6 text-muted-foreground">
            Додайте товари, щоб оформити замовлення
          </p>
          <Button asChild>
            <Link href="/shop">Перейти до каталогу</Link>
          </Button>
        </div>
      </main>
    )
  }

  if (isComplete && order) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f4efe8_0%,#fbf7f2_34%,#ffffff_100%)]">
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-[2rem] border border-black/8 bg-white/95 px-6 py-10 text-center shadow-[0_28px_80px_rgba(16,24,40,0.1)] md:px-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-foreground/40">
              Order complete
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-foreground md:text-4xl">
              Дякуємо за замовлення
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Ваше замовлення #{order.displayId} успішно оформлено. Ми надіслали деталі на{' '}
              {order.email} та підготуємо все до відправки найближчим часом.
            </p>

            <div className="mx-auto mt-8 max-w-2xl rounded-[1.75rem] border border-black/6 bg-[linear-gradient(180deg,#fcf8f2_0%,#ffffff_100%)] p-6 text-left">
              <h3 className="mb-4 font-semibold">Деталі замовлення</h3>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-muted-foreground">Отримувач</span>
                  <p className="font-medium text-foreground sm:mt-1">
                    {checkoutData.contact?.firstName} {checkoutData.contact?.lastName}
                  </p>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-muted-foreground">Телефон</span>
                  <p className="font-medium text-foreground sm:mt-1">{checkoutData.contact?.phone}</p>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-muted-foreground">Місто</span>
                  <p className="font-medium text-foreground sm:mt-1">{checkoutData.shipping?.city}</p>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-muted-foreground">Відділення НП</span>
                  <p className="font-medium text-foreground sm:mt-1">{checkoutData.shipping?.warehouse}</p>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-muted-foreground">Оплата</span>
                  <p className="font-medium text-foreground sm:mt-1">
                    {checkoutData.payment?.method === 'cod'
                      ? 'Накладений платіж'
                      : 'Онлайн оплата'}
                  </p>
                </div>
                <div className="flex justify-between gap-3 sm:block">
                  <span className="text-muted-foreground">Сума</span>
                  <p className="font-semibold text-foreground sm:mt-1">
                    {Math.round(order.total)} ₴
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/shop">Продовжити покупки</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/">На головну</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

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
    } catch {
      setError('Не вдалося зберегти контактну інформацію. Спробуйте ще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShippingSubmit = async (data: ShippingData) => {
    if (!cart) return
    setError(null)
    setIsProcessing(true)

    try {
      const warehouseInfo = data.warehouseRef
        ? `НП: ${data.warehouse} [ref:${data.warehouseRef}]`
        : `НП: ${data.warehouse}`
      const addressData = {
        firstName: checkoutData.contact?.firstName || '',
        lastName: checkoutData.contact?.lastName || '',
        phone: checkoutData.contact?.phone,
        city: data.city,
        address1: warehouseInfo,
        countryCode: 'ua',
        postalCode: '00000',
      }

      await updateCartAddresses({
        shippingAddress: addressData,
        billingAddress: addressData,
      })

      const selectedOption = shippingOptions.find(
        (opt) => opt.methodId === data.shippingMethodId
      )

      if (selectedOption) {
        await setCartShippingMethod(selectedOption.methodId, selectedOption.price)
      } else if (shippingOptions.length > 0) {
        await setCartShippingMethod(
          shippingOptions[0].methodId,
          shippingOptions[0].price
        )
      }

      await refreshCart()
      setCheckoutData((prev) => ({ ...prev, shipping: data }))
      trackAddShippingInfo(analyticsItems, data.shippingMethodId, cart.total)
      setCurrentStep('payment')
    } catch {
      setError('Не вдалося зберегти інформацію про доставку. Спробуйте ще раз.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSubmit = async (data: PaymentData) => {
    if (!cart) return
    setError(null)
    setIsProcessing(true)

    try {
      setCheckoutData((prev) => ({ ...prev, payment: data }))
      trackAddPaymentInfo(analyticsItems, data.method, cart.total)

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4eee6_0%,#fbf7f2_30%,#ffffff_100%)]">
      <div className="border-b border-black/6 bg-white/75">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Повернутися до покупок
          </Link>
        </div>
      </div>

      <div ref={heroRef} className="relative overflow-hidden">
        <div
          data-checkout-orb
          className="pointer-events-none absolute left-[6%] top-10 h-28 w-28 rounded-full bg-[#efe2d0] blur-3xl"
        />
        <div
          data-checkout-orb
          className="pointer-events-none absolute right-[10%] top-14 h-32 w-32 rounded-full bg-[#d9e7d7] blur-3xl"
        />

        <div className="container mx-auto px-4 pb-8 pt-10 md:pb-10 md:pt-14">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.92))] px-6 py-8 shadow-[0_28px_90px_rgba(16,24,40,0.1)] md:px-10 md:py-10">
            <p
              data-checkout-hero-badge
              className="w-fit rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/48"
            >
              Checkout flow
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)] lg:items-end">
              <div>
                <h1
                  data-checkout-hero-title
                  className="max-w-3xl text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-foreground md:text-5xl"
                >
                  Оформлення без зайвого шуму, з чіткими кроками та швидким фінішем.
                </h1>
                <p
                  data-checkout-hero-copy
                  className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg"
                >
                  Ми зберегли знайомий процес покупки, але оформили його як більш зібраний premium-flow: швидке заповнення, зрозумілі етапи й адаптація під мобайл.
                </p>
              </div>

              <div
                data-checkout-hero-stats
                className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1"
              >
                <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Кроки</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">3</p>
                  <p className="mt-1 text-sm text-muted-foreground">Контакти, доставка, оплата</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Поточний кошик</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{items.length}</p>
                  <p className="mt-1 text-sm text-muted-foreground">позицій готові до оформлення</p>
                </div>
                <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Мобайл</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">100%</p>
                  <p className="mt-1 text-sm text-muted-foreground">комфортний сценарій для невеликих екранів</p>
                </div>
              </div>
            </div>

            <div
              data-checkout-hero-note
              className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground"
            >
              <span className="rounded-full bg-white/75 px-3 py-1.5">
                Адаптивно для Safari, Chrome та mobile browsers
              </span>
              <span className="rounded-full bg-white/75 px-3 py-1.5">
                Анімації вимикаються при reduced motion
              </span>
            </div>
          </div>
        </div>
      </div>

      <div ref={stageRef} className="container mx-auto px-4 pb-12">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-[1.5rem] border border-destructive/25 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="rounded-[2rem] border border-black/8 bg-white/75 p-4 shadow-[0_20px_60px_rgba(16,24,40,0.08)] md:p-6">
            <CheckoutSteps currentStep={currentStep} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
            <div className="space-y-6">
              <div
                data-checkout-panel
                className="rounded-[2rem] border border-black/8 bg-white/92 p-6 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:p-8"
              >
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

              <div
                data-checkout-trust
                className="grid gap-3 sm:grid-cols-3"
              >
                {checkoutHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4 text-sm text-muted-foreground"
                  >
                    <item.icon className="mb-3 h-5 w-5 text-primary" />
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 leading-6">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:sticky xl:top-24 xl:self-start">
              <div data-checkout-summary className="space-y-4">
                <OrderSummary cart={cart} />
                {cart && (
                  <div className="rounded-[1.75rem] border border-black/8 bg-white/92 p-4 shadow-[0_20px_50px_rgba(16,24,40,0.07)]">
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
      </div>
    </main>
  )
}
