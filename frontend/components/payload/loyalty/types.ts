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
  pointsPerUah: number
  pointValue: number
  maxSpendPercentage: number
  welcomeBonus: number
  referralBonus: number
  bronzeMin: number
  bronzeMultiplier: number
  silverMin: number
  silverMultiplier: number
  goldMin: number
  goldMultiplier: number
  isActive: boolean
}

export interface LoyaltyCustomer {
  id: string
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  } | string | number | null
  pointsBalance: number
  totalEarned: number
  totalSpent: number
  level: 'bronze' | 'silver' | 'gold'
  referralCode: string
  isEnabled: boolean
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
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  } | string | number | null
  transactionType: string
  pointsAmount: number
  orderId: string | null
  description: string | null
  balanceAfter: number
  createdAt: string
}

export interface CustomerData {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
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
