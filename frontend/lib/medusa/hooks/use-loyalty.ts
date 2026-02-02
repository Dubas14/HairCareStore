'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLoyaltyStore, LoyaltySummary, LoyaltyTransaction, LoyaltyCalculation } from '@/stores/loyalty-store'
import { useAuthStore } from '@/stores/auth-store'
import { useEffect } from 'react'

// API response types
interface LoyaltyResponse {
  loyalty: LoyaltySummary
}

interface TransactionsResponse {
  transactions: LoyaltyTransaction[]
  count: number
  limit: number
  offset: number
}

interface ReferralResponse {
  message: string
  loyalty: LoyaltySummary
}

interface CalculateResponse extends LoyaltyCalculation {}

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

// Get auth token from Medusa SDK storage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try common Medusa token keys
  return (
    localStorage.getItem('_medusa_jwt_token') ||
    localStorage.getItem('medusa_auth_token') ||
    localStorage.getItem('token') ||
    null
  )
}

// Fetch with SDK auth token
async function fetchWithAuth<T>(url: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getAuthToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': PUBLISHABLE_KEY,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
    headers,
  })

  if (response.status === 400 || response.status === 401) {
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Hook to get customer loyalty summary
 */
export function useLoyalty() {
  const { summary, isLoading, error, setSummary, setLoading, setError } = useLoyaltyStore()
  const { isAuthenticated, isLoading: authLoading, customer } = useAuthStore()

  // Only fetch when:
  // 1. We're on the client
  // 2. Auth loading is complete (not loading)
  // 3. User is authenticated
  // 4. Customer object exists (double-check)
  const isClient = typeof window !== 'undefined'
  const shouldFetch = isClient && !authLoading && isAuthenticated && !!customer

  const query = useQuery({
    queryKey: ['loyalty', 'summary', shouldFetch],
    queryFn: async (): Promise<LoyaltySummary | null> => {
      // Triple-check before making request
      const authState = useAuthStore.getState()
      if (!authState.customer || !authState.isAuthenticated || authState.isLoading) {
        return null
      }
      try {
        const response = await fetchWithAuth<LoyaltyResponse>('/store/loyalty')
        return response.loyalty
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    enabled: shouldFetch,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 0, // Don't cache when disabled
  })

  useEffect(() => {
    if (!shouldFetch) {
      setSummary(null)
      setLoading(false)
      setError(null)
      return
    }

    if (query.isLoading) {
      setLoading(true)
    } else {
      setLoading(false)
      if (query.error) {
        setError(query.error instanceof Error ? query.error.message : 'Помилка завантаження')
      } else {
        setSummary(query.data ?? null)
      }
    }
  }, [query.data, query.isLoading, query.error, shouldFetch, setSummary, setLoading, setError])

  return {
    summary,
    isLoading: isLoading || query.isLoading,
    error,
    refetch: query.refetch,
  }
}

/**
 * Hook to get loyalty transaction history
 */
export function useLoyaltyTransactions(limit = 20, offset = 0) {
  const { transactions, transactionsCount, setTransactions } = useLoyaltyStore()
  const { isAuthenticated, isLoading: authLoading, customer } = useAuthStore()

  // Only fetch when fully authenticated
  const isClient = typeof window !== 'undefined'
  const shouldFetch = isClient && !authLoading && isAuthenticated && !!customer

  const query = useQuery({
    queryKey: ['loyalty-transactions', limit, offset, shouldFetch],
    queryFn: async (): Promise<TransactionsResponse | null> => {
      // Triple-check before making request
      const authState = useAuthStore.getState()
      if (!authState.customer || !authState.isAuthenticated || authState.isLoading) {
        return null
      }
      try {
        return await fetchWithAuth<TransactionsResponse>(
          `/store/loyalty/transactions?limit=${limit}&offset=${offset}`
        )
      } catch {
        return null
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
    enabled: shouldFetch,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    gcTime: 0,
  })

  useEffect(() => {
    if (!shouldFetch) {
      setTransactions([], 0)
      return
    }
    if (query.data) {
      setTransactions(query.data.transactions, query.data.count)
    }
  }, [query.data, shouldFetch, setTransactions])

  return {
    transactions,
    count: transactionsCount,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

/**
 * Hook to apply referral code
 */
export function useApplyReferralCode() {
  const queryClient = useQueryClient()
  const { setSummary, setError } = useLoyaltyStore()

  return useMutation({
    mutationFn: async (referralCode: string): Promise<ReferralResponse> => {
      return fetchWithAuth<ReferralResponse>('/store/loyalty/referral', {
        method: 'POST',
        body: JSON.stringify({ referral_code: referralCode }),
      })
    },
    onSuccess: (data) => {
      setSummary(data.loyalty)
      queryClient.invalidateQueries({ queryKey: ['loyalty'] })
      queryClient.invalidateQueries({ queryKey: ['loyalty-transactions'] })
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Помилка застосування коду')
    },
  })
}

/**
 * Hook to calculate loyalty points for checkout
 */
export function useCalculateLoyaltyPoints() {
  const { setCalculation } = useLoyaltyStore()

  return useMutation({
    mutationFn: async (data: {
      orderTotal: number
      pointsToSpend?: number
    }): Promise<CalculateResponse> => {
      return fetchWithAuth<CalculateResponse>('/store/loyalty/calculate', {
        method: 'POST',
        body: JSON.stringify({
          order_total: data.orderTotal,
          points_to_spend: data.pointsToSpend || 0,
        }),
      })
    },
    onSuccess: (data) => {
      setCalculation(data)
    },
  })
}

/**
 * Get level display name in Ukrainian
 */
export function getLevelDisplayName(level: string): string {
  const names: Record<string, string> = {
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
  }
  return names[level] || level
}

/**
 * Get level color for styling
 */
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
  }
  return colors[level] || '#CD7F32'
}

/**
 * Get level gradient for backgrounds
 */
export function getLevelGradient(level: string): string {
  const gradients: Record<string, string> = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
  }
  return gradients[level] || gradients.bronze
}
