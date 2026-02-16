import { create } from 'zustand'

export interface LoyaltySummary {
  id: number | string
  customerId: number | string
  pointsBalance: number
  totalEarned: number
  totalSpent: number
  level: 'bronze' | 'silver' | 'gold'
  levelMultiplier: number
  referralCode: string
  referredBy: string | null
  nextLevel: 'silver' | 'gold' | null
  pointsToNextLevel: number
  progressPercent: number
  isEnabled: boolean
}

export interface LoyaltyTransaction {
  id: string
  customer_id: string
  transaction_type: 'earned' | 'spent' | 'expired' | 'welcome' | 'referral' | 'adjustment'
  points_amount: number
  order_id: string | null
  description: string | null
  balance_after: number
  created_at: string
}

export interface LoyaltyCalculation {
  currentBalance: number
  level: string
  levelMultiplier: number
  pointsToEarn: number
  maxSpendable: number
  requestedSpend: number
  actualDiscount: number
  finalTotal: number
}

interface LoyaltyState {
  summary: LoyaltySummary | null
  transactions: LoyaltyTransaction[]
  transactionsCount: number
  calculation: LoyaltyCalculation | null
  isLoading: boolean
  error: string | null
  setSummary: (summary: LoyaltySummary | null) => void
  setTransactions: (transactions: LoyaltyTransaction[], count: number) => void
  setCalculation: (calculation: LoyaltyCalculation | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useLoyaltyStore = create<LoyaltyState>()((set) => ({
  summary: null,
  transactions: [],
  transactionsCount: 0,
  calculation: null,
  isLoading: false,
  error: null,
  setSummary: (summary) => set({ summary, error: null }),
  setTransactions: (transactions, count) => set({ transactions, transactionsCount: count }),
  setCalculation: (calculation) => set({ calculation }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({
    summary: null,
    transactions: [],
    transactionsCount: 0,
    calculation: null,
    isLoading: false,
    error: null,
  }),
}))
