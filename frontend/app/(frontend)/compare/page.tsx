'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X, GitCompareArrows, ShoppingBag, Star, ArrowLeft } from 'lucide-react'
import { useCompareStore } from '@/stores/compare-store'
import { useCartContext } from '@/components/providers/cart-provider'
import { useState } from 'react'

export default function ComparePage() {
  const { items, removeItem, clearCompare } = useCompareStore()
  const { addToCart } = useCartContext()
  const [addingId, setAddingId] = useState<number | null>(null)

  const handleAddToCart = async (productId: number | string | undefined, variantIndex: number) => {
    if (!productId) return
    setAddingId(typeof productId === 'string' ? parseInt(productId) : productId as number)
    try {
      await addToCart(productId, variantIndex, 1)
    } catch {
      // silently fail
    } finally {
      setAddingId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <GitCompareArrows className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Порівняння товарів</h1>
        <p className="text-muted-foreground mb-6">
          Додайте товари для порівняння, натиснувши кнопку порівняння на картці товару
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          До каталогу
        </Link>
      </div>
    )
  }

  if (items.length === 1) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <GitCompareArrows className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Порівняння товарів</h1>
        <p className="text-muted-foreground mb-6">
          Додайте ще хоча б один товар для порівняння
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          До каталогу
        </Link>
      </div>
    )
  }

  const rows: Array<{ label: string; getValue: (item: (typeof items)[0]) => React.ReactNode }> = [
    {
      label: 'Бренд',
      getValue: (item) => item.brand || '—',
    },
    {
      label: 'Ціна',
      getValue: (item) => (
        <div>
          <span className="text-lg font-bold text-foreground">{item.price} грн</span>
          {item.oldPrice && (
            <span className="text-sm text-muted-foreground line-through ml-2">
              {item.oldPrice} грн
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'Знижка',
      getValue: (item) =>
        item.discount ? (
          <span className="text-sm font-semibold text-sale">-{item.discount}%</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      label: 'Рейтинг',
      getValue: (item) => (
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(item.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-muted text-muted'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({item.reviewCount})</span>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Порівняння товарів</h1>
          <p className="text-sm text-muted-foreground">{items.length} товари</p>
        </div>
        <button
          onClick={clearCompare}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Очистити все
        </button>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[600px] border-collapse">
          {/* Product images & names */}
          <thead>
            <tr>
              <th className="w-[140px] p-3 text-left text-sm font-medium text-muted-foreground align-bottom">
                Товар
              </th>
              {items.map((item) => (
                <th key={item.id} className="p-3 text-center align-bottom min-w-[180px]">
                  <div className="relative">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -top-1 -right-1 p-1 bg-muted rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors z-10"
                      aria-label={`Видалити ${item.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <Link href={`/products/${item.slug}`} className="block group">
                      <div className="w-32 h-32 mx-auto mb-3 rounded-card overflow-hidden bg-muted border border-border">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </p>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 === 0 ? 'bg-muted/30' : ''}
              >
                <td className="p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {row.label}
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-3 text-center text-sm">
                    {row.getValue(item)}
                  </td>
                ))}
              </tr>
            ))}

            {/* Add to cart row */}
            <tr>
              <td className="p-3" />
              {items.map((item) => (
                <td key={item.id} className="p-3 text-center">
                  <button
                    onClick={() => handleAddToCart(item.productId, item.variantIndex ?? 0)}
                    disabled={!item.productId || addingId === item.id}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {addingId === item.id ? 'Додаємо...' : 'У кошик'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
