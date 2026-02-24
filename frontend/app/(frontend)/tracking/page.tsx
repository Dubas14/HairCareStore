'use client'

import { useState } from 'react'
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

/** NP tracking progress steps */
const npProgressSteps = [
  { icon: Clock, label: 'Створено' },
  { icon: Package, label: 'Прийнято' },
  { icon: Truck, label: 'В дорозі' },
  { icon: MapPin, label: 'На відділенні' },
  { icon: CheckCircle, label: 'Отримано' },
]

function getBasicStep(fulfillmentStatus: string): number {
  switch (fulfillmentStatus) {
    case 'not_fulfilled': return 1
    case 'shipped': return 2
    case 'delivered': return 3
    default: return 0
  }
}

export default function TrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<OrderTrackingResult | null>(null)
  const [npTracking, setNpTracking] = useState<TrackingResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

        // Try NP real-time tracking if TTN exists
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

  const currencySymbol = result?.currency === 'EUR' ? '€' : result?.currency === 'PLN' ? 'zł' : '₴'

  // Determine which progress to show
  const hasNpTracking = npTracking && npTracking.step > 0
  const progressStep = hasNpTracking ? npTracking.step : (result ? getBasicStep(result.fulfillmentStatus) : 0)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          До каталогу
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Відстеження замовлення</h1>
        <p className="text-muted-foreground mb-8">
          Введіть номер замовлення та email для перевірки статусу
        </p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-card p-6 shadow-soft mb-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium mb-1">
                Номер замовлення
              </label>
              <input
                id="orderNumber"
                type="text"
                inputMode="numeric"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="12345"
                className="w-full h-11 px-4 bg-background border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full h-11 px-4 bg-background border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Пошук...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Знайти замовлення
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Not Found */}
        {notFound && (
          <div className="bg-muted/50 rounded-card p-6 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">Замовлення не знайдено</p>
            <p className="text-sm text-muted-foreground">
              Перевірте номер замовлення та email
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-card rounded-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Замовлення #{result.displayId}</h2>
                <p className="text-sm text-muted-foreground">
                  від {new Date(result.createdAt).toLocaleDateString('uk-UA')}
                </p>
              </div>
              <p className="text-lg font-semibold">
                {Math.round(result.total)} {currencySymbol}
              </p>
            </div>

            {/* Progress Steps */}
            {hasNpTracking ? (
              /* NP detailed progress (5 steps) */
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {npProgressSteps.map((s, i) => {
                    const active = progressStep > i
                    const current = progressStep === i + 1
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                          active || current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] sm:text-xs text-center leading-tight ${
                          active || current ? 'font-semibold text-foreground' : 'text-muted-foreground'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* NP status label */}
                <div className="mt-4 p-3 bg-primary/5 rounded-md text-center">
                  <p className="text-sm font-medium text-primary">{npTracking.stepLabel}</p>
                  {npTracking.status !== npTracking.stepLabel && (
                    <p className="text-xs text-muted-foreground mt-0.5">{npTracking.status}</p>
                  )}
                </div>
              </div>
            ) : (
              /* Basic 3-step progress */
              <div className="flex items-center justify-between mb-8">
                {[
                  { icon: Clock, label: 'В обробці' },
                  { icon: Truck, label: 'Відправлено' },
                  { icon: CheckCircle, label: 'Доставлено' },
                ].map((s, i) => {
                  const active = progressStep > i
                  const current = progressStep === i + 1
                  return (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        active || current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs text-center ${
                        active || current ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* NP Route info */}
            {hasNpTracking && (npTracking.senderCity || npTracking.recipientCity) && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <span>{npTracking.senderCity}</span>
                <ArrowRight className="w-4 h-4" />
                <span>{npTracking.recipientCity}</span>
              </div>
            )}

            {/* NP Delivery date */}
            {hasNpTracking && npTracking.scheduledDeliveryDate && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span>
                  Очікувана доставка: <span className="font-medium">{npTracking.scheduledDeliveryDate}</span>
                </span>
              </div>
            )}

            {/* Details */}
            <div className="space-y-3 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус</span>
                <span className="font-medium">{statusLabels[result.status] || result.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span className="font-medium">{fulfillmentLabels[result.fulfillmentStatus] || result.fulfillmentStatus}</span>
              </div>
              {result.shippingMethod && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Спосіб доставки</span>
                  <span className="font-medium">{result.shippingMethod}</span>
                </div>
              )}
              {result.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Номер ТТН</span>
                  <a
                    href={`https://novaposhta.ua/tracking/?cargo_number=${result.trackingNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {result.trackingNumber}
                  </a>
                </div>
              )}
              {hasNpTracking && npTracking.actualDeliveryDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Дата отримання</span>
                  <span className="font-medium">{npTracking.actualDeliveryDate}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
