'use client'

import Link from 'next/link'
import { ChevronRight, Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  type PayloadOrder,
  getOrderStatusLabel,
  getOrderStatusColor,
} from '@/lib/hooks/use-orders'

interface OrderCardProps {
  order: PayloadOrder
}

export function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const firstItemImage = order.items?.[0]?.thumbnail

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block bg-card rounded-2xl p-5 border border-border shadow-soft hover:shadow-soft-lg transition-all group animate-fadeInUp"
    >
      <div className="flex gap-4">
        {/* Order image preview */}
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {firstItemImage ? (
            <img
              src={firstItemImage}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-6 h-6 text-muted-foreground" />
          )}
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">Замовлення #{order.displayId}</p>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
            </div>
            <Badge className={getOrderStatusColor(order.status)}>
              {getOrderStatusLabel(order.status)}
            </Badge>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товари' : 'товарів'}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-semibold">{Math.round(order.total)} ₴</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
