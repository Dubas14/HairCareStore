'use client'

import { useState } from 'react'
import { Star, User, Send, CheckCircle, LogIn } from 'lucide-react'
import type { Review } from '@/lib/payload/types'
import { submitReview } from '@/lib/payload/actions'
import { useAuthStore } from '@/stores/auth-store'

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

function InteractiveStarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
          aria-label={`${star} ${star === 1 ? 'зірка' : star < 5 ? 'зірки' : 'зірок'}`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewForm({ productId, onSubmitted }: { productId: number | string; onSubmitted: () => void }) {
  const { customer } = useAuthStore()
  const defaultName = customer ? [customer.firstName, customer.lastName].filter(Boolean).join(' ') : ''
  const [name, setName] = useState(defaultName)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || name.trim().length < 2) {
      setError('Вкажіть ваше імʼя (мінімум 2 символи)')
      return
    }
    if (rating === 0) {
      setError('Оберіть оцінку')
      return
    }
    if (!text.trim() || text.trim().length < 10) {
      setError('Напишіть відгук (мінімум 10 символів)')
      return
    }

    setSubmitting(true)
    const result = await submitReview({
      customerName: name.trim(),
      rating,
      text: text.trim(),
      productId,
    })
    setSubmitting(false)

    if (result.success) {
      setSuccess(true)
      setName('')
      setRating(0)
      setText('')
      onSubmitted()
    } else {
      setError(result.error || 'Помилка при відправці')
    }
  }

  if (success) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-card p-6 text-center">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Дякуємо за ваш відгук!</p>
        <p className="text-sm text-muted-foreground">
          Він зʼявиться на сторінці після модерації
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Залишити ще один відгук
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-card p-5 border border-border space-y-4">
      <h3 className="text-base font-semibold text-foreground">Залишити відгук</h3>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Ваше імʼя <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Імʼя"
          maxLength={100}
          className="w-full h-10 px-3 bg-background border border-border rounded-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Оцінка <span className="text-destructive">*</span>
        </label>
        <InteractiveStarRating value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Ваш відгук <span className="text-destructive">*</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Розкажіть про ваш досвід використання..."
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2.5 bg-background border border-border rounded-input text-sm leading-relaxed resize-vertical focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">{text.length}/2000</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Відправка...' : 'Відправити відгук'}
      </button>
    </form>
  )
}

function LoginPrompt() {
  return (
    <div className="bg-muted/30 rounded-card p-5 border border-border text-center mb-6">
      <LogIn className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
      <p className="font-medium text-foreground mb-1">Увійдіть, щоб залишити відгук</p>
      <p className="text-sm text-muted-foreground mb-4">Відгуки можуть залишати тільки зареєстровані користувачі</p>
      <a
        href="/account/login"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Увійти в акаунт
      </a>
    </div>
  )
}

export function ProductReviews({ reviews, productId }: ProductReviewsProps) {
  const { isAuthenticated } = useAuthStore()
  const [showAll, setShowAll] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3)

  const averageRating = reviews.length > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  return (
    <section>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Star className="w-4 h-4" />
            Залишити відгук
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          {isAuthenticated ? (
            <ReviewForm productId={productId} onSubmitted={() => {}} />
          ) : (
            <LoginPrompt />
          )}
        </div>
      )}

      {reviews.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-muted/30 rounded-card">
          <p className="text-muted-foreground mb-2">Відгуків поки немає</p>
          <p className="text-sm text-muted-foreground mb-4">Будьте першим, хто залишить відгук про цей товар</p>
          {isAuthenticated ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Star className="w-4 h-4" />
              Написати відгук
            </button>
          ) : (
            <a
              href="/account/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-input text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Увійти, щоб написати відгук
            </a>
          )}
        </div>
      ) : reviews.length > 0 ? (
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
      ) : null}
    </section>
  )
}
