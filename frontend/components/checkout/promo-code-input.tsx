'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Tag, X, Loader2, Check } from 'lucide-react'
import { applyPromoCode, removePromoCode } from '@/lib/payload/promo-actions'

interface PromoCodeInputProps {
  cartId: string | number
  email?: string
  appliedCode?: string
  appliedDiscount?: number
  currency?: string
  onApplied: (code: string, discount: number) => void
  onRemoved: () => void
}

export function PromoCodeInput({
  cartId,
  email,
  appliedCode,
  appliedDiscount,
  currency = 'UAH',
  onApplied,
  onRemoved,
}: PromoCodeInputProps) {
  const t = useTranslations('checkout')
  const tCommon = useTranslations('common')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleApply = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await applyPromoCode(code, cartId, email)

    if (result.success) {
      setSuccess(result.message)
      setCode('')
      onApplied(code.toUpperCase().trim(), result.discount)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const handleRemove = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await removePromoCode(cartId)

    if (result.success) {
      onRemoved()
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  // Show applied state
  if (appliedCode) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              {appliedCode}
            </span>
            {appliedDiscount ? (
              <span className="text-sm text-emerald-600">
                &minus;{appliedDiscount} {currency}
              </span>
            ) : null}
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="p-1 rounded-full hover:bg-emerald-100 transition-colors"
            aria-label={tCommon('delete')}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <X className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('promoCode') || 'Промокод'}
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl text-sm
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-all placeholder:text-muted-foreground"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-foreground text-background rounded-xl text-sm font-medium
            hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed
            transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            tCommon('save') || 'OK'
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-600">{success}</p>
      )}
    </div>
  )
}
