'use client'

import { useEffect, useState, useRef } from 'react'
import { Gift, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLoyalty, useCalculateLoyaltyPoints, getLevelDisplayName } from '@/lib/hooks/use-loyalty'
import { useLoyaltyStore } from '@/stores/loyalty-store'
import { useAuthStore } from '@/stores/auth-store'

interface LoyaltyPointsSectionProps {
  orderTotal: number
  onPointsChange: (points: number, discount: number) => void
}

export function LoyaltyPointsSection({ orderTotal, onPointsChange }: LoyaltyPointsSectionProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { summary, isLoading: summaryLoading } = useLoyalty()
  const calculatePoints = useCalculateLoyaltyPoints()
  const { calculation } = useLoyaltyStore()

  const [pointsToSpend, setPointsToSpend] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const initialCalcDone = useRef(false)

  // Calculate on load and when order total changes
  useEffect(() => {
    if (summary && orderTotal > 0 && !initialCalcDone.current) {
      calculatePoints.mutate({ orderTotal, pointsToSpend: 0, currentBalance: summary.pointsBalance, level: summary.level })
      initialCalcDone.current = true
    }
  }, [summary, orderTotal])

  // Recalculate when points slider changes
  useEffect(() => {
    if (summary && orderTotal > 0 && initialCalcDone.current) {
      calculatePoints.mutate({ orderTotal, pointsToSpend, currentBalance: summary.pointsBalance, level: summary.level })
    }
  }, [pointsToSpend])

  // Reset when order total changes
  useEffect(() => {
    initialCalcDone.current = false
    setPointsToSpend(0)
  }, [orderTotal])

  // Notify parent about discount changes
  useEffect(() => {
    if (calculation) {
      onPointsChange(pointsToSpend, calculation.actualDiscount)
    } else {
      onPointsChange(0, 0)
    }
  }, [calculation, pointsToSpend, onPointsChange])

  // Don't show if not authenticated or auth still loading
  if (!isAuthenticated || authLoading) {
    return null
  }

  // Show loader only briefly
  if (summaryLoading && !summary) {
    return (
      <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Don't show if no balance
  if (!summary || summary.pointsBalance === 0) {
    return null
  }

  const maxSpendable = calculation?.maxSpendable || 0
  const sliderPercent = maxSpendable > 0 ? (pointsToSpend / maxSpendable) * 100 : 0

  return (
    <div className="bg-gradient-to-r from-[#2A9D8F]/5 to-[#48CAE4]/5 rounded-xl border border-[#2A9D8F]/20">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-[#2A9D8F]" />
          </div>
          <div>
            <p className="font-medium">Оплатити бонусами</p>
            <p className="text-sm text-muted-foreground">
              Доступно: <span className="font-medium text-[#2A9D8F]">{summary.pointsBalance}</span> балів
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pointsToSpend > 0 && (
            <span className="text-sm font-medium text-green-600">-{pointsToSpend} ₴</span>
          )}
          <svg
            className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Використати балів:</span>
              <span className="font-medium">{pointsToSpend} балів = {pointsToSpend} ₴</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxSpendable}
              value={pointsToSpend}
              onChange={(e) => setPointsToSpend(Number(e.target.value))}
              disabled={maxSpendable === 0}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#2A9D8F] disabled:opacity-50"
              style={{
                background: `linear-gradient(to right, #2A9D8F ${sliderPercent}%, #e5e7eb ${sliderPercent}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>Макс: {maxSpendable}</span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-full text-xs"
              onClick={() => setPointsToSpend(0)}
            >
              Не використовувати
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-full text-xs"
              onClick={() => setPointsToSpend(maxSpendable)}
              disabled={maxSpendable === 0}
            >
              Максимум ({maxSpendable})
            </Button>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1 бал = 1 ₴ знижки. Максимум 30% від суми замовлення.</p>
              {calculation && (
                <p>
                  За це замовлення ви отримаєте{' '}
                  <span className="font-medium text-[#2A9D8F]">+{calculation.pointsToEarn}</span> балів
                  {summary.level !== 'gold' && (
                    <span> (множник {getLevelDisplayName(summary.level)}: x{calculation.levelMultiplier})</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
