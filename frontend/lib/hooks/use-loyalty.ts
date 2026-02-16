'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { useLoyaltyStore } from '@/stores/loyalty-store'
import { getLoyaltySummary, getLoyaltyTransactions, applyReferralCode, calculateLoyaltyForCheckout } from '@/lib/payload/loyalty-actions'
import type { LoyaltySummary, LoyaltyTransaction } from '@/stores/loyalty-store'
import { useEffect } from 'react'

export type { LoyaltySummary, LoyaltyTransaction }

export function useLoyalty() {
  const { summary, isLoading, error, setSummary, setLoading, setError } = useLoyaltyStore()
  const { isAuthenticated, isLoading: authLoading, customer } = useAuthStore()
  const shouldFetch = typeof window !== 'undefined' && !authLoading && isAuthenticated && !!customer

  const query = useQuery({
    queryKey: ['loyalty', 'summary', shouldFetch ? customer?.id : null],
    queryFn: async () => customer ? getLoyaltySummary(customer.id) as Promise<LoyaltySummary | null> : null,
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: shouldFetch,
  })

  useEffect(() => {
    if (!shouldFetch) { setSummary(null); setLoading(false); setError(null); return }
    if (query.isLoading) setLoading(true)
    else { setLoading(false); query.error ? setError('Помилка завантаження') : setSummary(query.data ?? null) }
  }, [query.data, query.isLoading, query.error, shouldFetch, setSummary, setLoading, setError])

  return { summary, isLoading: isLoading || query.isLoading, error, refetch: query.refetch }
}

export function useLoyaltyTransactions(limit = 20, offset = 0) {
  const { transactions, transactionsCount, setTransactions } = useLoyaltyStore()
  const { isAuthenticated, isLoading: authLoading, customer } = useAuthStore()
  const shouldFetch = typeof window !== 'undefined' && !authLoading && isAuthenticated && !!customer

  const query = useQuery({
    queryKey: ['loyalty-transactions', limit, offset, customer?.id],
    queryFn: async () => customer ? getLoyaltyTransactions(customer.id, limit, offset) : null,
    staleTime: 1000 * 60 * 2,
    retry: false,
    enabled: shouldFetch,
  })

  useEffect(() => {
    if (!shouldFetch) { setTransactions([], 0); return }
    if (query.data) setTransactions(query.data.transactions as any[], query.data.count)
  }, [query.data, shouldFetch, setTransactions])

  return { transactions, count: transactionsCount, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}

export function useApplyReferralCode() {
  const queryClient = useQueryClient()
  const { setSummary, setError } = useLoyaltyStore()
  const { customer } = useAuthStore()
  return useMutation({
    mutationFn: async (referralCode: string) => {
      if (!customer) throw new Error('Not authenticated')
      return applyReferralCode(customer.id, referralCode)
    },
    onSuccess: (data) => { if (data) setSummary(data as any); queryClient.invalidateQueries({ queryKey: ['loyalty'] }) },
    onError: (error) => { setError(error instanceof Error ? error.message : 'Помилка') },
  })
}

export function useCalculateLoyaltyPoints() {
  const { setCalculation } = useLoyaltyStore()
  return useMutation({
    mutationFn: async (data: { orderTotal: number; pointsToSpend?: number; currentBalance: number; level: string }) => {
      return calculateLoyaltyForCheckout(data.orderTotal, data.currentBalance, data.level, data.pointsToSpend)
    },
    onSuccess: (data) => { setCalculation(data as any) },
  })
}

export function getLevelDisplayName(level: string): string {
  return { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' }[level] || level
}

export function getLevelColor(level: string): string {
  return { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' }[level] || '#CD7F32'
}

export function getLevelGradient(level: string): string {
  return { bronze: 'from-amber-600 to-amber-800', silver: 'from-gray-400 to-gray-600', gold: 'from-yellow-400 to-yellow-600' }[level] || 'from-amber-600 to-amber-800'
}
