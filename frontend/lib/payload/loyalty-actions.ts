'use server'

import {
  getCustomerLoyaltySummary,
  getTransactionHistory,
  awardReferralBonus,
  calculatePointsFromOrder,
  calculateMaxSpendablePoints,
  type LoyaltySummary,
  type LoyaltyTransaction,
} from './loyalty-service'

export type { LoyaltySummary, LoyaltyTransaction }

export async function getLoyaltySummary(customerId: number | string): Promise<LoyaltySummary | null> {
  if (!customerId) return null
  return getCustomerLoyaltySummary(customerId)
}

export async function getLoyaltyTransactions(customerId: number | string, limit?: number, offset?: number): Promise<{ transactions: LoyaltyTransaction[]; count: number }> {
  if (!customerId) return { transactions: [], count: 0 }
  return getTransactionHistory(customerId, limit, offset)
}

export async function applyReferralCode(customerId: number | string, referralCode: string): Promise<LoyaltySummary | null> {
  await awardReferralBonus(customerId, referralCode)
  return getCustomerLoyaltySummary(customerId)
}

export async function calculateLoyaltyForCheckout(orderTotal: number, currentBalance: number, level: string, pointsToSpend: number = 0) {
  const pointsToEarn = calculatePointsFromOrder(orderTotal, level)
  const maxSpendable = calculateMaxSpendablePoints(orderTotal, currentBalance)
  const actualSpend = Math.min(pointsToSpend, maxSpendable)
  const actualDiscount = actualSpend
  const finalTotal = orderTotal - actualDiscount
  return { pointsToEarn, maxSpendable, actualDiscount, finalTotal }
}
