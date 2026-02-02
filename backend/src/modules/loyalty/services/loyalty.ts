import { MedusaService } from "@medusajs/framework/utils"
import { LoyaltyPoints } from "../models/loyalty-points"
import { LoyaltyTransaction } from "../models/loyalty-transaction"

// Constants for loyalty program
const POINTS_PER_UAH = 0.1 // 1 point per 10 UAH
const WELCOME_BONUS = 100
const REFERRAL_BONUS = 200
const MAX_SPEND_PERCENTAGE = 0.3 // 30% of order

const LEVEL_THRESHOLDS = {
  bronze: { min: 0, max: 999, multiplier: 1.0 },
  silver: { min: 1000, max: 4999, multiplier: 1.05 },
  gold: { min: 5000, max: Infinity, multiplier: 1.1 },
} as const

type LoyaltyLevel = "bronze" | "silver" | "gold"
type TransactionType = "earned" | "spent" | "expired" | "welcome" | "referral" | "adjustment"

// Generate unique referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = "REF"
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Determine level based on total earned points
function determineLevel(totalEarned: number): LoyaltyLevel {
  if (totalEarned >= LEVEL_THRESHOLDS.gold.min) return "gold"
  if (totalEarned >= LEVEL_THRESHOLDS.silver.min) return "silver"
  return "bronze"
}

class LoyaltyModuleService extends MedusaService({
  LoyaltyPoints,
  LoyaltyTransaction,
}) {
  /**
   * Get or create loyalty record for a customer
   */
  async getOrCreateLoyaltyRecord(customerId: string) {
    const existing = await this.listLoyaltyPoints({
      customer_id: customerId,
    })

    if (existing.length > 0) {
      return existing[0]
    }

    // Create new record with unique referral code
    let referralCode = generateReferralCode()
    let attempts = 0
    const maxAttempts = 10

    // Ensure referral code is unique
    while (attempts < maxAttempts) {
      const existingCode = await this.listLoyaltyPoints({
        referral_code: referralCode,
      })
      if (existingCode.length === 0) break
      referralCode = generateReferralCode()
      attempts++
    }

    const record = await this.createLoyaltyPoints({
      customer_id: customerId,
      points_balance: 0,
      total_earned: 0,
      total_spent: 0,
      level: "bronze",
      referral_code: referralCode,
      referred_by: null,
    })

    return record
  }

  /**
   * Award welcome bonus to new customer
   */
  async awardWelcomeBonus(customerId: string) {
    const record = await this.getOrCreateLoyaltyRecord(customerId)

    // Check if welcome bonus already awarded
    const existingWelcome = await this.listLoyaltyTransactions({
      customer_id: customerId,
      transaction_type: "welcome",
    })

    if (existingWelcome.length > 0) {
      return record // Already awarded
    }

    const newBalance = record.points_balance + WELCOME_BONUS
    const newTotalEarned = record.total_earned + WELCOME_BONUS

    await this.updateLoyaltyPoints({
      id: record.id,
      points_balance: newBalance,
      total_earned: newTotalEarned,
      level: determineLevel(newTotalEarned),
    })

    await this.createLoyaltyTransactions({
      customer_id: customerId,
      transaction_type: "welcome" as TransactionType,
      points_amount: WELCOME_BONUS,
      order_id: null,
      description: "Бонус за реєстрацію",
      balance_after: newBalance,
    })

    return this.retrieveLoyaltyPoints(record.id)
  }

  /**
   * Award referral bonus to both referrer and referee
   */
  async awardReferralBonus(customerId: string, referralCode: string) {
    const customerRecord = await this.getOrCreateLoyaltyRecord(customerId)

    // Check if customer already used a referral code
    if (customerRecord.referred_by) {
      throw new Error("Ви вже використали реферальний код")
    }

    // Check if trying to use own code
    if (customerRecord.referral_code === referralCode) {
      throw new Error("Не можна використати власний реферальний код")
    }

    // Find referrer by code
    const referrers = await this.listLoyaltyPoints({
      referral_code: referralCode,
    })

    if (referrers.length === 0) {
      throw new Error("Невірний реферальний код")
    }

    const referrer = referrers[0]

    // Update referee (current customer)
    const customerNewBalance = customerRecord.points_balance + REFERRAL_BONUS
    const customerNewTotalEarned = customerRecord.total_earned + REFERRAL_BONUS

    await this.updateLoyaltyPoints({
      id: customerRecord.id,
      points_balance: customerNewBalance,
      total_earned: customerNewTotalEarned,
      level: determineLevel(customerNewTotalEarned),
      referred_by: referralCode,
    })

    await this.createLoyaltyTransactions({
      customer_id: customerId,
      transaction_type: "referral" as TransactionType,
      points_amount: REFERRAL_BONUS,
      order_id: null,
      description: `Бонус за реферальний код ${referralCode}`,
      balance_after: customerNewBalance,
    })

    // Update referrer
    const referrerNewBalance = referrer.points_balance + REFERRAL_BONUS
    const referrerNewTotalEarned = referrer.total_earned + REFERRAL_BONUS

    await this.updateLoyaltyPoints({
      id: referrer.id,
      points_balance: referrerNewBalance,
      total_earned: referrerNewTotalEarned,
      level: determineLevel(referrerNewTotalEarned),
    })

    await this.createLoyaltyTransactions({
      customer_id: referrer.customer_id,
      transaction_type: "referral" as TransactionType,
      points_amount: REFERRAL_BONUS,
      order_id: null,
      description: "Бонус за запрошеного друга",
      balance_after: referrerNewBalance,
    })

    return this.retrieveLoyaltyPoints(customerRecord.id)
  }

  /**
   * Earn points from a completed order
   */
  async earnPointsFromOrder(customerId: string, orderId: string, orderTotal: number) {
    const record = await this.getOrCreateLoyaltyRecord(customerId)

    // Check if points already awarded for this order
    const existingTransaction = await this.listLoyaltyTransactions({
      customer_id: customerId,
      order_id: orderId,
      transaction_type: "earned",
    })

    if (existingTransaction.length > 0) {
      return record // Already awarded
    }

    const pointsEarned = this.calculatePointsFromOrder(orderTotal, record.level as LoyaltyLevel)
    const newBalance = record.points_balance + pointsEarned
    const newTotalEarned = record.total_earned + pointsEarned
    const newLevel = determineLevel(newTotalEarned)

    await this.updateLoyaltyPoints({
      id: record.id,
      points_balance: newBalance,
      total_earned: newTotalEarned,
      level: newLevel,
    })

    await this.createLoyaltyTransactions({
      customer_id: customerId,
      transaction_type: "earned" as TransactionType,
      points_amount: pointsEarned,
      order_id: orderId,
      description: `Нарахування за замовлення`,
      balance_after: newBalance,
    })

    return this.retrieveLoyaltyPoints(record.id)
  }

  /**
   * Spend points on an order
   */
  async spendPointsOnOrder(
    customerId: string,
    orderId: string,
    pointsToSpend: number,
    orderTotal: number
  ) {
    const record = await this.getOrCreateLoyaltyRecord(customerId)

    // Validate points
    const maxSpendable = this.calculateMaxSpendablePoints(orderTotal, record.points_balance)

    if (pointsToSpend > maxSpendable) {
      throw new Error(`Максимум можна використати ${maxSpendable} балів`)
    }

    if (pointsToSpend > record.points_balance) {
      throw new Error("Недостатньо балів")
    }

    const newBalance = record.points_balance - pointsToSpend
    const newTotalSpent = record.total_spent + pointsToSpend

    await this.updateLoyaltyPoints({
      id: record.id,
      points_balance: newBalance,
      total_spent: newTotalSpent,
    })

    await this.createLoyaltyTransactions({
      customer_id: customerId,
      transaction_type: "spent" as TransactionType,
      points_amount: -pointsToSpend,
      order_id: orderId,
      description: `Списання на замовлення`,
      balance_after: newBalance,
    })

    return {
      pointsSpent: pointsToSpend,
      discount: pointsToSpend, // 1 point = 1 UAH
      newBalance,
    }
  }

  /**
   * Calculate points earned from order total
   */
  calculatePointsFromOrder(orderTotal: number, level: LoyaltyLevel): number {
    const multiplier = LEVEL_THRESHOLDS[level].multiplier
    const basePoints = Math.floor(orderTotal * POINTS_PER_UAH)
    return Math.floor(basePoints * multiplier)
  }

  /**
   * Calculate max points that can be spent on an order
   */
  calculateMaxSpendablePoints(orderTotal: number, currentBalance: number): number {
    const maxByOrder = Math.floor(orderTotal * MAX_SPEND_PERCENTAGE)
    return Math.min(maxByOrder, currentBalance)
  }

  /**
   * Get customer loyalty summary for UI
   */
  async getCustomerLoyaltySummary(customerId: string) {
    const record = await this.getOrCreateLoyaltyRecord(customerId)

    const currentLevel = record.level as LoyaltyLevel
    const levelInfo = LEVEL_THRESHOLDS[currentLevel]

    // Calculate progress to next level
    let nextLevel: LoyaltyLevel | null = null
    let pointsToNextLevel = 0

    if (currentLevel === "bronze") {
      nextLevel = "silver"
      pointsToNextLevel = LEVEL_THRESHOLDS.silver.min - record.total_earned
    } else if (currentLevel === "silver") {
      nextLevel = "gold"
      pointsToNextLevel = LEVEL_THRESHOLDS.gold.min - record.total_earned
    }

    return {
      id: record.id,
      customerId: record.customer_id,
      pointsBalance: record.points_balance,
      totalEarned: record.total_earned,
      totalSpent: record.total_spent,
      level: currentLevel,
      levelMultiplier: levelInfo.multiplier,
      referralCode: record.referral_code,
      referredBy: record.referred_by,
      nextLevel,
      pointsToNextLevel: Math.max(0, pointsToNextLevel),
      progressPercent: nextLevel
        ? Math.min(
            100,
            Math.floor(
              ((record.total_earned - LEVEL_THRESHOLDS[currentLevel].min) /
                (LEVEL_THRESHOLDS[nextLevel].min - LEVEL_THRESHOLDS[currentLevel].min)) *
                100
            )
          )
        : 100,
    }
  }

  /**
   * Get transaction history for a customer
   */
  async getTransactionHistory(customerId: string, limit = 20, offset = 0) {
    const transactions = await this.listLoyaltyTransactions({
      customer_id: customerId,
    })

    // Sort by created_at descending and apply pagination
    const sorted = transactions.sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return {
      transactions: sorted.slice(offset, offset + limit),
      count: transactions.length,
      limit,
      offset,
    }
  }
}

export default LoyaltyModuleService
