'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useLoyalty,
  useLoyaltyTransactions,
  useApplyReferralCode,
  getLevelDisplayName,
  getLevelGradient,
} from '@/lib/hooks/use-loyalty'
import {
  Gift,
  Copy,
  Check,
  Loader2,
  TrendingUp,
  TrendingDown,
  Star,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

function LevelBadge({ level }: { level: string }) {
  const gradient = getLevelGradient(level)
  const displayName = getLevelDisplayName(level)

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${gradient}`}
    >
      <Star className="w-3.5 h-3.5" />
      {displayName}
    </span>
  )
}

function TransactionIcon({ type }: { type: string }) {
  switch (type) {
    case 'earned':
      return <TrendingUp className="w-4 h-4 text-green-500" />
    case 'spent':
      return <TrendingDown className="w-4 h-4 text-red-500" />
    case 'welcome':
      return <Gift className="w-4 h-4 text-[#2A9D8F]" />
    case 'referral':
      return <Users className="w-4 h-4 text-purple-500" />
    default:
      return <Sparkles className="w-4 h-4 text-gray-500" />
  }
}

function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    earned: 'Нараховано',
    spent: 'Списано',
    expired: 'Згорів',
    welcome: 'Welcome бонус',
    referral: 'Реферальний бонус',
    adjustment: 'Коригування',
  }
  return labels[type] || type
}

export function LoyaltyTab() {
  const { summary, isLoading, error, refetch } = useLoyalty()
  const { transactions, isLoading: transactionsLoading } = useLoyaltyTransactions()
  const applyReferral = useApplyReferralCode()

  const [referralInput, setReferralInput] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    if (summary?.referralCode) {
      await navigator.clipboard.writeText(summary.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return
    try {
      await applyReferral.mutateAsync(referralInput.trim())
      setReferralInput('')
    } catch {
      // Error handled by mutation
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2A9D8F]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft text-center animate-fadeInUp">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Gift className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Програма лояльності</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => refetch()} className="rounded-full bg-[#2A9D8F] hover:bg-[#238B7E]">
          Спробувати ще
        </Button>
      </div>
    )
  }

  // Loyalty is disabled for this customer
  if (!summary) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft text-center animate-fadeInUp">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <Gift className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Програма лояльності</h3>
        <p className="text-muted-foreground">
          Бонусна програма поки що недоступна для вашого акаунту.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] rounded-2xl p-6 text-white relative overflow-hidden animate-fadeInUp">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white/80">Ваш баланс</h3>
            <LevelBadge level={summary.level} />
          </div>

          <div className="mb-6">
            <p className="text-5xl font-bold mb-1">{summary.pointsBalance}</p>
            <p className="text-white/70">бонусних балів</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-2xl font-bold">{summary.totalEarned}</p>
              <p className="text-sm text-white/70">Всього зароблено</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
              <p className="text-2xl font-bold">{summary.totalSpent}</p>
              <p className="text-sm text-white/70">Всього витрачено</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      {summary.nextLevel && (
        <div className="bg-card rounded-2xl p-6 shadow-soft animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold mb-4">Прогрес до наступного рівня</h3>
          <div className="flex items-center gap-4 mb-3">
            <LevelBadge level={summary.level} />
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <LevelBadge level={summary.nextLevel} />
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] rounded-full transition-all duration-500"
              style={{ width: `${summary.progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Ще <span className="font-medium text-foreground">{summary.pointsToNextLevel}</span> балів до рівня{' '}
            <span className="font-medium">{getLevelDisplayName(summary.nextLevel)}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Множник нарахування: x{summary.levelMultiplier}
          </p>
        </div>
      )}

      {/* Referral Section */}
      <div className="bg-card rounded-2xl p-6 shadow-soft animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#2A9D8F]" />
          Реферальна програма
        </h3>

        {/* Your referral code */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Ваш реферальний код</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-lg font-medium">
              {summary.referralCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={handleCopyCode}
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Поділіться кодом з друзями - ви обоє отримаєте по 200 балів!
          </p>
        </div>

        {/* Apply referral code */}
        {!summary.referredBy && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Введіть код друга</p>
            <div className="flex gap-2">
              <Input
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="REFXXXXXX"
                className="h-12 rounded-xl font-mono"
                maxLength={9}
              />
              <Button
                onClick={handleApplyReferral}
                disabled={!referralInput.trim() || applyReferral.isPending}
                className="h-12 px-6 rounded-xl bg-[#2A9D8F] hover:bg-[#238B7E]"
              >
                {applyReferral.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Застосувати'
                )}
              </Button>
            </div>
            {applyReferral.error && (
              <p className="text-sm text-destructive mt-2">
                {applyReferral.error instanceof Error
                  ? applyReferral.error.message
                  : 'Помилка застосування коду'}
              </p>
            )}
          </div>
        )}

        {summary.referredBy && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Ви використали код:</p>
            <p className="font-mono font-medium">{summary.referredBy}</p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="bg-card rounded-2xl p-6 shadow-soft animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-lg font-semibold mb-4">Як працює програма</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2A9D8F]/10 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-[#2A9D8F]" />
            </div>
            <div>
              <p className="font-medium">1 бал = 10 грн</p>
              <p className="text-sm text-muted-foreground">Отримуйте бали за кожну покупку</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#48CAE4]/10 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-[#48CAE4]" />
            </div>
            <div>
              <p className="font-medium">1 бал = 1 грн знижки</p>
              <p className="text-sm text-muted-foreground">Оплачуйте до 30% замовлення</p>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm font-medium mb-2">Рівні лояльності:</p>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
              Bronze: 0-999 балів (x1.0)
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              Silver: 1000-4999 балів (x1.05)
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Gold: 5000+ балів (x1.10)
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-card rounded-2xl p-6 shadow-soft animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <h3 className="text-lg font-semibold mb-4">Історія операцій</h3>

        {transactionsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#2A9D8F]" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Операцій поки немає</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <TransactionIcon type={tx.transaction_type} />
                  </div>
                  <div>
                    <p className="font-medium">{getTransactionTypeLabel(tx.transaction_type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {tx.description ||
                        new Date(tx.created_at).toLocaleDateString('uk-UA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      tx.points_amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {tx.points_amount > 0 ? '+' : ''}
                    {tx.points_amount}
                  </p>
                  <p className="text-xs text-muted-foreground">Баланс: {tx.balance_after}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
