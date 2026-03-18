'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
  MapPin,
  Calendar,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { trackOrder, trackNovaPoshtaShipment } from '@/lib/payload/shipping-actions'
import type { TrackingResult } from '@/lib/shipping/nova-poshta-types'
import { ensureGsapPlugins, prefersReducedMotion } from '@/lib/gsap'

interface OrderTrackingResult {
  displayId: number
  status: string
  fulfillmentStatus: string
  trackingNumber?: string
  shippingMethod?: string
  createdAt: string
  total: number
  currency: string
}

const statusLabels: Record<string, string> = {
  pending: 'Очікує підтвердження',
  confirmed: 'Підтверджено',
  processing: 'В обробці',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
  cancelled: 'Скасовано',
}

const fulfillmentLabels: Record<string, string> = {
  not_fulfilled: 'Не відправлено',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
}

const npProgressSteps = [
  { icon: Clock, label: 'Створено' },
  { icon: Package, label: 'Прийнято' },
  { icon: Truck, label: 'В дорозі' },
  { icon: MapPin, label: 'На відділенні' },
  { icon: CheckCircle, label: 'Отримано' },
]

function getBasicStep(fulfillmentStatus: string): number {
  switch (fulfillmentStatus) {
    case 'not_fulfilled':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    default:
      return 0
  }
}

export default function TrackingPage() {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<OrderTrackingResult | null>(null)
  const [npTracking, setNpTracking] = useState<TrackingResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasResult = Boolean(result)

  useEffect(() => {
    if (!pageRef.current || prefersReducedMotion()) return

    const { gsap } = ensureGsapPlugins()
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-tracking-hero], [data-tracking-form], [data-tracking-status], [data-tracking-empty]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          stagger: 0.08,
          ease: 'power2.out',
        }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [hasResult, notFound])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotFound(false)
    setResult(null)
    setNpTracking(null)

    const num = parseInt(orderNumber)
    if (!num || !email) {
      setError('Введіть номер замовлення та email')
      return
    }

    setIsLoading(true)
    try {
      const data = await trackOrder(num, email)
      if (data.found && data.order) {
        setResult(data.order)

        if (data.order.trackingNumber) {
          const npData = await trackNovaPoshtaShipment(data.order.trackingNumber)
          setNpTracking(npData)
        }
      } else {
        setNotFound(true)
      }
    } catch {
      setError('Помилка при пошуку замовлення')
    } finally {
      setIsLoading(false)
    }
  }

  const currencySymbol =
    result?.currency === 'EUR' ? '€' : result?.currency === 'PLN' ? 'zł' : '₴'

  const hasNpTracking = npTracking && npTracking.step > 0
  const progressStep = hasNpTracking
    ? npTracking.step
    : result
    ? getBasicStep(result.fulfillmentStatus)
    : 0

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4eee6_0%,#fbf7f2_34%,#ffffff_100%)]">
      <div ref={pageRef} className="container mx-auto px-4 py-10 md:py-14">
        <div
          data-tracking-hero
          className="mx-auto max-w-5xl rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,239,227,0.92))] px-6 py-8 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:px-10"
        >
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-[0_10px_24px_rgba(16,24,40,0.05)] transition-transform hover:-translate-y-0.5 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            До каталогу
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(250px,0.92fr)] lg:items-end">
            <div>
              <p className="w-fit rounded-full border border-black/10 bg-white/75 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/48">
                Tracking center
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[0.92] tracking-[-0.06em] text-foreground md:text-5xl">
                Відстеження замовлення в одному екрані, без зайвих дзвінків.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Введіть номер замовлення та email, щоб побачити статус оформлення, доставку і, якщо є ТТН, маршрут Нової Пошти.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Формат</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Live status</p>
                <p className="mt-1 text-sm text-muted-foreground">етапи замовлення в читабельному вигляді</p>
              </div>
              <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Мобайл</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Responsive</p>
                <p className="mt-1 text-sm text-muted-foreground">усі блоки складаються в акуратну стрічку</p>
              </div>
              <div className="rounded-[1.5rem] border border-black/8 bg-white/80 p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/45">Дані</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">Nova Poshta</p>
                <p className="mt-1 text-sm text-muted-foreground">авто-підтягування статусу за ТТН</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-5xl grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <form
            data-tracking-form
            onSubmit={handleSubmit}
            className="rounded-[2rem] border border-black/8 bg-white/94 p-6 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:p-8"
          >
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
              Знайти замовлення
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Введіть дані, які використовували під час оформлення.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor="orderNumber" className="mb-2 block text-sm font-medium">
                  Номер замовлення
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  inputMode="numeric"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="12345"
                  className="h-12 w-full rounded-[1rem] border border-border bg-background px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 w-full rounded-[1rem] border border-border bg-background px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <p className="rounded-[1rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="h-12 w-full rounded-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Пошук...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Знайти замовлення
                  </span>
                )}
              </Button>
            </div>
          </form>

          {notFound && (
            <div
              data-tracking-empty
              className="rounded-[2rem] border border-black/8 bg-white/92 p-8 text-center shadow-[0_24px_70px_rgba(16,24,40,0.08)]"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f7efe3]">
                <Package className="h-9 w-9 text-foreground/65" />
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Замовлення не знайдено
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Перевірте номер замовлення та email. Якщо проблема лишається, ми допоможемо через підтримку.
              </p>
            </div>
          )}

          {result && (
            <div
              data-tracking-status
              className="rounded-[2rem] border border-black/8 bg-white/94 p-6 shadow-[0_28px_80px_rgba(16,24,40,0.08)] md:p-8"
            >
              <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-foreground/45">
                    Order #{result.displayId}
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                    Статус замовлення
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    від {new Date(result.createdAt).toLocaleDateString('uk-UA')}
                  </p>
                </div>
                <p className="text-2xl font-semibold text-foreground">
                  {Math.round(result.total)} {currencySymbol}
                </p>
              </div>

              <div className="mt-6">
                {hasNpTracking ? (
                  <div className="grid gap-3 md:grid-cols-5">
                    {npProgressSteps.map((step, i) => {
                      const active = progressStep > i
                      const current = progressStep === i + 1

                      return (
                        <div
                          key={step.label}
                          className={`rounded-[1.4rem] border p-4 text-center ${
                            active || current
                              ? 'border-[#1f2a20] bg-[#f7efe3]'
                              : 'border-border bg-[#fcfaf7]'
                          }`}
                        >
                          <div
                            className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
                              active || current
                                ? 'bg-[#1f2a20] text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>
                          <p className={`text-sm ${active || current ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { icon: Clock, label: 'В обробці' },
                      { icon: Truck, label: 'Відправлено' },
                      { icon: CheckCircle, label: 'Доставлено' },
                    ].map((step, i) => {
                      const active = progressStep > i
                      const current = progressStep === i + 1

                      return (
                        <div
                          key={step.label}
                          className={`rounded-[1.4rem] border p-4 text-center ${
                            active || current
                              ? 'border-[#1f2a20] bg-[#f7efe3]'
                              : 'border-border bg-[#fcfaf7]'
                          }`}
                        >
                          <div
                            className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
                              active || current
                                ? 'bg-[#1f2a20] text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <step.icon className="h-5 w-5" />
                          </div>
                          <p className={`text-sm ${active || current ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {hasNpTracking && (
                  <div className="mt-4 rounded-[1.4rem] border border-[#e9e1d4] bg-[#fcf5ea] p-4 text-center">
                    <p className="text-sm font-semibold text-primary">{npTracking.stepLabel}</p>
                    {npTracking.status !== npTracking.stepLabel && (
                      <p className="mt-1 text-xs text-muted-foreground">{npTracking.status}</p>
                    )}
                  </div>
                )}

                {hasNpTracking && (npTracking.senderCity || npTracking.recipientCity) && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                    <span>{npTracking.senderCity}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{npTracking.recipientCity}</span>
                  </div>
                )}

                {hasNpTracking && npTracking.scheduledDeliveryDate && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Очікувана доставка:{' '}
                      <span className="font-medium">{npTracking.scheduledDeliveryDate}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-black/6 bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/42">
                    Статус
                  </p>
                  <p className="mt-3 text-base font-medium text-foreground">
                    {statusLabels[result.status] || result.status}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {fulfillmentLabels[result.fulfillmentStatus] || result.fulfillmentStatus}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-black/6 bg-[#fcfaf7] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/42">
                    Доставка
                  </p>
                  <p className="mt-3 text-base font-medium text-foreground">
                    {result.shippingMethod || 'Нова Пошта'}
                  </p>
                  {result.trackingNumber ? (
                    <a
                      href={`https://novaposhta.ua/tracking/?cargo_number=${result.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      ТТН: {result.trackingNumber}
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">ТТН з&apos;явиться після відправлення.</p>
                  )}
                </div>
              </div>

              {hasNpTracking && npTracking.actualDeliveryDate && (
                <div className="mt-4 rounded-[1.5rem] border border-black/6 bg-white px-5 py-4 text-sm text-muted-foreground">
                  Дата отримання:{' '}
                  <span className="font-medium text-foreground">{npTracking.actualDeliveryDate}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
