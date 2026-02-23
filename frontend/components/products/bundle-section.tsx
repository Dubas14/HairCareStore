'use client'

import { useQuery } from '@tanstack/react-query'
import { Package, Plus, ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getBundlesForProduct } from '@/lib/payload/actions'
import { getImageUrl, type PayloadProduct } from '@/lib/payload/types'
import { formatPrice } from '@/lib/utils/format-price'
import { useCartContext } from '@/components/providers/cart-provider'
import { cn } from '@/lib/utils'

interface BundleSectionProps {
  productId: number | string
  className?: string
}

export function BundleSection({ productId, className }: BundleSectionProps) {
  const t = useTranslations('product')
  const { addToCart } = useCartContext()

  const { data: bundles } = useQuery({
    queryKey: ['bundles', 'product', String(productId)],
    queryFn: () => getBundlesForProduct(productId),
    enabled: !!productId,
  })

  if (!bundles || bundles.length === 0) return null

  return (
    <section className={cn('py-8', className)}>
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">{t('completeRoutine')}</h2>
      </div>

      <div className="space-y-6">
        {bundles.map((bundle) => {
          const products = bundle.products.filter(
            (p): p is PayloadProduct => typeof p === 'object' && p !== null,
          )
          if (products.length < 2) return null

          const totalPrice = products.reduce(
            (sum, p) => sum + (p.variants?.[0]?.price || 0),
            0,
          )
          const discountAmount =
            bundle.discountType === 'percentage'
              ? Math.round(totalPrice * (bundle.discountValue / 100))
              : bundle.discountValue
          const bundlePrice = Math.max(0, totalPrice - discountAmount)

          const handleAddBundle = async () => {
            for (const p of products) {
              await addToCart(p.id, 0, 1)
            }
          }

          return (
            <div
              key={String(bundle.id)}
              className="border border-border rounded-xl p-5 bg-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">
                  {bundle.title}
                </h3>
                <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  -{bundle.discountType === 'percentage'
                    ? `${bundle.discountValue}%`
                    : formatPrice(bundle.discountValue)}
                </span>
              </div>

              {bundle.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {bundle.description}
                </p>
              )}

              {/* Products in bundle */}
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {products.map((p, i) => (
                  <div key={String(p.id)} className="flex items-center gap-2">
                    <Link
                      href={`/products/${p.handle}`}
                      className="flex items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {getImageUrl(p.thumbnail) ? (
                          <Image
                            src={getImageUrl(p.thumbnail)!}
                            alt={p.title}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[120px] group-hover:text-primary transition-colors">
                          {p.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(p.variants?.[0]?.price || 0)}
                        </p>
                      </div>
                    </Link>
                    {i < products.length - 1 && (
                      <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0 mx-1" />
                    )}
                  </div>
                ))}
              </div>

              {/* Price + Add to Cart */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(bundlePrice)}
                  </span>
                  {discountAmount > 0 && (
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      {formatPrice(totalPrice)}
                    </span>
                  )}
                </div>
                <Button size="sm" onClick={handleAddBundle}>
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  Додати набір
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
