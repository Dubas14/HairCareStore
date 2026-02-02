'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Loader2,
  ShoppingCart,
  CheckCircle,
  Clock,
  Truck,
  Home,
} from 'lucide-react'
import { useOrder, getOrderStatusLabel, getOrderStatusColor } from '@/lib/medusa/hooks/use-orders'
import { useCustomer } from '@/lib/medusa/hooks/use-customer'
import { useAddToCart } from '@/lib/medusa/hooks/use-cart'
import { useCartContext } from '@/components/providers/cart-provider'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

function getImageUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder-product.jpg'
  if (url.startsWith('http')) return url
  return `${MEDUSA_BACKEND_URL}${url}`
}

// Order progress steps
const progressSteps = [
  { key: 'placed', label: 'Оформлено', icon: CheckCircle },
  { key: 'processing', label: 'Обробка', icon: Clock },
  { key: 'shipped', label: 'Відправлено', icon: Truck },
  { key: 'delivered', label: 'Доставлено', icon: Home },
]

function getProgressStep(status: string): number {
  switch (status) {
    case 'pending':
    case 'requires_action':
      return 1
    case 'completed':
      return 4
    case 'canceled':
    case 'archived':
      return 0
    default:
      return 1
  }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { customer, isLoading: isCustomerLoading, isAuthenticated } = useCustomer()
  const { order, isLoading: isOrderLoading } = useOrder(id)
  const addToCart = useAddToCart()
  const { cart } = useCartContext()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isCustomerLoading && !isAuthenticated) {
      router.push('/account/login')
    }
  }, [isCustomerLoading, isAuthenticated, router])

  const handleReorder = async () => {
    if (!order?.items || !cart) return

    // Add all items to cart
    for (const item of order.items) {
      if (item.variant?.id) {
        try {
          await addToCart.mutateAsync({
            cartId: cart.id,
            variantId: item.variant.id,
            quantity: item.quantity,
          })
        } catch (error) {
          console.error('Failed to add item to cart:', error)
        }
      }
    }

    router.push('/checkout')
  }

  if (isCustomerLoading || isOrderLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Замовлення не знайдено</h1>
          <p className="text-muted-foreground mb-6">
            Це замовлення не існує або було видалено
          </p>
          <Button asChild>
            <Link href="/account">Повернутися до кабінету</Link>
          </Button>
        </div>
      </main>
    )
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const currentStep = getProgressStep(order.status)
  const isCanceled = order.status === 'canceled' || order.status === 'archived'

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад до замовлень
          </Link>
          <h1 className="text-2xl font-display font-semibold text-white">
            Замовлення #{order.display_id}
          </h1>
          <p className="text-white/80 mt-1">{formattedDate}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Status badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${getOrderStatusColor(order.status)} px-3 py-1`}>
              {getOrderStatusLabel(order.status)}
            </Badge>
          </div>

          {/* Progress steps */}
          {!isCanceled && (
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center justify-between relative">
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-[#2A9D8F] transition-all"
                  style={{ width: `${((currentStep - 1) / (progressSteps.length - 1)) * 100}%` }}
                />

                {progressSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = index < currentStep
                  const isCurrent = index === currentStep - 1

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#2A9D8F] text-white'
                            : 'bg-muted text-muted-foreground'
                        } ${isCurrent ? 'ring-4 ring-[#2A9D8F]/20' : ''}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-xs mt-2 ${
                          isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Товари
            </h2>
            <div className="divide-y divide-border">
              {order.items?.map((item) => {
                const imageUrl = getImageUrl(item.thumbnail || item.variant?.product?.thumbnail)
                const productHandle = item.variant?.product?.handle

                return (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    {productHandle ? (
                      <Link
                        href={`/products/${productHandle}`}
                        className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {productHandle ? (
                        <Link
                          href={`/products/${productHandle}`}
                          className="font-medium hover:text-[#2A9D8F] transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <p className="font-medium line-clamp-2">{item.title}</p>
                      )}
                      {item.variant?.title && item.variant.title !== 'Default' && (
                        <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {Math.round(item.unit_price)} ₴
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{Math.round(item.subtotal)} ₴</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shipping address */}
          {order.shipping_address && (
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Доставка
              </h2>
              <div className="space-y-1 text-sm">
                <p className="font-medium">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                {order.shipping_address.phone && (
                  <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                )}
                <p>
                  {order.shipping_address.city}
                  {order.shipping_address.address_1 && `, ${order.shipping_address.address_1}`}
                </p>
              </div>
            </div>
          )}

          {/* Order summary */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Підсумок
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Товари</span>
                <span>{Math.round(order.subtotal)} ₴</span>
              </div>
              {order.discount_total > 0 && (
                <div className="flex justify-between text-success">
                  <span>Знижка</span>
                  <span>-{Math.round(order.discount_total)} ₴</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Доставка</span>
                <span>
                  {order.shipping_total > 0
                    ? `${Math.round(order.shipping_total)} ₴`
                    : 'Безкоштовно'}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Разом</span>
                <span>{Math.round(order.total)} ₴</span>
              </div>
            </div>
          </div>

          {/* Reorder button */}
          {!isCanceled && order.items && order.items.length > 0 && (
            <Button
              onClick={handleReorder}
              disabled={addToCart.isPending}
              className="w-full h-12 rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]"
            >
              {addToCart.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Додаємо товари...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Повторити замовлення
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
