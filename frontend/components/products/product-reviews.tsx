'use client'

import { useState } from 'react'
import { Star, User } from 'lucide-react'
import type { Review } from '@/lib/payload/types'

interface ProductReviewsProps {
  reviews: Review[]
  productId: number | string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  )
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ProductReviews({ reviews, productId }: ProductReviewsProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Відгуки
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <StarRating rating={Math.round(averageRating)} />
              <span>{averageRating} з 5</span>
              <span>({reviews.length} {reviews.length === 1 ? 'відгук' : reviews.length < 5 ? 'відгуки' : 'відгуків'})</span>
            </div>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-card">
          <p className="text-muted-foreground mb-2">Відгуків поки немає</p>
          <p className="text-sm text-muted-foreground">Будьте першим, хто залишить відгук про цей товар</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="bg-card rounded-card p-5 border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {review.customerName}
                    </p>
                    {review.publishedAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.publishedAt)}
                      </p>
                    )}
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              <p className="text-foreground/90 text-sm leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}

          {reviews.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-border rounded-card hover:bg-muted/50"
            >
              Показати всі відгуки ({reviews.length})
            </button>
          )}
        </div>
      )}
    </section>
  )
}
