'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, User, Send, CheckCircle, LogIn, Camera, X, BadgeCheck, ImageIcon } from 'lucide-react'
import type { Review } from '@/lib/payload/types'
import { getImageUrl } from '@/lib/payload/types'
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

function ReviewImageLightbox({ images, initialIndex, onClose }: {
  images: Array<{ image: { url?: string; alt?: string } }>
  initialIndex: number
  onClose: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const current = images[currentIndex]
  const url = current?.image?.url

  if (!url) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/40 rounded-full z-10"
        aria-label="Закрити"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative max-w-3xl max-h-[85vh] w-full" onClick={e => e.stopPropagation()}>
        <Image
          src={url}
          alt={current.image.alt || 'Фото відгуку'}
          width={800}
          height={600}
          className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
        />

        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Фото ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const reviewImages = review.images?.filter(img => img.image && getImageUrl(img.image)) || []

  return (
    <div className="bg-card rounded-card p-5 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground text-sm">
                {review.customerName}
              </p>
              {review.verifiedPurchase && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Підтверджена покупка
                </span>
              )}
            </div>
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

      {reviewImages.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {reviewImages.map((img, idx) => {
            const url = getImageUrl(img.image)
            if (!url) return null
            return (
              <button
                key={idx}
                onClick={() => setLightboxIndex(idx)}
                className="relative w-16 h-16 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors group"
              >
                <Image
                  src={url}
                  alt={img.image?.alt || `Фото ${idx + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="64px"
                />
              </button>
            )
          })}
        </div>
      )}

      {lightboxIndex !== null && (
        <ReviewImageLightbox
          images={reviewImages as Array<{ image: { url?: string; alt?: string } }>}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

type ReviewFilter = 'all' | 'with_photos' | 'verified' | '5' | '4' | '3' | '2' | '1'

export function ProductReviews({ reviews, productId }: ProductReviewsProps) {
  const { isAuthenticated } = useAuthStore()
  const [showAll, setShowAll] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<ReviewFilter>('all')

  const filteredReviews = reviews.filter(r => {
    if (filter === 'with_photos') return r.images && r.images.length > 0
    if (filter === 'verified') return r.verifiedPurchase
    if (['1','2','3','4','5'].includes(filter)) return r.rating === Number(filter)
    return true
  })

  const displayedReviews = showAll ? filteredReviews : filteredReviews.slice(0, 3)

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

      {reviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { key: 'all' as ReviewFilter, label: 'Всі' },
            { key: 'with_photos' as ReviewFilter, label: 'З фото', icon: <ImageIcon className="w-3.5 h-3.5" /> },
            { key: 'verified' as ReviewFilter, label: 'Підтверджені', icon: <BadgeCheck className="w-3.5 h-3.5" /> },
            { key: '5' as ReviewFilter, label: '5' },
            { key: '4' as ReviewFilter, label: '4' },
            { key: '3' as ReviewFilter, label: '3' },
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => { setFilter(key); setShowAll(false) }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                filter === key
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {icon}
              {['5','4','3'].includes(key) && <Star className="w-3 h-3 fill-current" />}
              {label}
            </button>
          ))}
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
            <ReviewCard key={review.id} review={review} />
          ))}

          {filteredReviews.length > 3 && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-border rounded-card hover:bg-muted/50"
            >
              Показати всі відгуки ({filteredReviews.length})
            </button>
          )}
        </div>
      ) : null}
    </section>
  )
}
