export interface LoyaltyStats {
  totalCustomers: number
  totalPoints: number
  totalEarned: number
  totalSpent: number
  levelCounts: {
    bronze: number
    silver: number
    gold: number
  }
  isActive: boolean
}

export interface LoyaltySettings {
  id: string
  points_per_uah: number
  point_value: number
  max_spend_percentage: number
  welcome_bonus: number
  referral_bonus: number
  bronze_min: number
  bronze_multiplier: number
  silver_min: number
  silver_multiplier: number
  gold_min: number
  gold_multiplier: number
  is_active: boolean
}

export interface LoyaltyCustomer {
  id: string
  customer_id: string
  points_balance: number
  total_earned: number
  total_spent: number
  level: 'bronze' | 'silver' | 'gold'
  referral_code: string
  is_enabled: boolean
  customer: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  } | null
}

export interface LoyaltySummary {
  id: string
  customerId: string
  pointsBalance: number
  totalEarned: number
  totalSpent: number
  level: 'bronze' | 'silver' | 'gold'
  levelMultiplier: number
  referralCode: string
  referredBy: string | null
  nextLevel: string | null
  pointsToNextLevel: number
  progressPercent: number
  isEnabled: boolean
}

export interface Transaction {
  id: string
  customer_id: string
  transaction_type: string
  points_amount: number
  order_id: string | null
  description: string | null
  balance_after: number
  created_at: string
  customer?: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  } | null
}

export interface CustomerData {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

export const transactionTypeLabels: Record<string, string> = {
  earned: 'Нараховано',
  spent: 'Списано',
  welcome: 'Welcome бонус',
  referral: 'Реферальний',
  adjustment: 'Коригування',
  expired: 'Прострочено',
}

export const transactionTypeColors: Record<string, string> = {
  earned: '#22c55e',
  spent: '#ef4444',
  welcome: '#3b82f6',
  referral: '#a855f7',
  adjustment: '#f97316',
  expired: '#6b7280',
}

export const levelColors: Record<string, string> = {
  bronze: '#b45309',
  silver: '#9ca3af',
  gold: '#eab308',
}
