/**
 * Loyalty Service — Business logic for HAIR LAB loyalty system
 * Server-only: uses Payload Local API
 */

import { getPayload } from 'payload'
import config from '@payload-config'

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
  id: number | string
  customer: number | string
  transactionType: 'earned' | 'spent' | 'expired' | 'welcome' | 'referral' | 'adjustment'
  pointsAmount: number
  orderId: string | null
  description: string | null
  balanceAfter: number
  createdAt: string
}

interface LoyaltySettings {
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

async function getSettings(): Promise<LoyaltySettings> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'loyalty-settings' })
    return settings as unknown as LoyaltySettings
  } catch {
    return {
      pointsPerUah: 0.1, pointValue: 1, maxSpendPercentage: 0.3,
      welcomeBonus: 100, referralBonus: 200,
      bronzeMin: 0, bronzeMultiplier: 1.0,
      silverMin: 1000, silverMultiplier: 1.05,
      goldMin: 5000, goldMultiplier: 1.1,
      isActive: true,
    }
  }
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'REF'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function calculateLevel(totalEarned: number, settings: LoyaltySettings) {
  if (totalEarned >= settings.goldMin) return { level: 'gold' as const, multiplier: settings.goldMultiplier, nextLevel: null, pointsToNextLevel: 0, progressPercent: 100 }
  if (totalEarned >= settings.silverMin) {
    const needed = settings.goldMin - totalEarned
    const progress = Math.round(((totalEarned - settings.silverMin) / (settings.goldMin - settings.silverMin)) * 100)
    return { level: 'silver' as const, multiplier: settings.silverMultiplier, nextLevel: 'gold' as const, pointsToNextLevel: needed, progressPercent: progress }
  }
  const needed = settings.silverMin - totalEarned
  const progress = settings.silverMin > 0 ? Math.round((totalEarned / settings.silverMin) * 100) : 0
  return { level: 'bronze' as const, multiplier: settings.bronzeMultiplier, nextLevel: 'silver' as const, pointsToNextLevel: needed, progressPercent: progress }
}

export async function getOrCreateLoyaltyRecord(customerId: number | string) {
  const payload = await getPayload({ config })
  const existing = await payload.find({ collection: 'loyalty-points', where: { customer: { equals: customerId } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0]
  return await payload.create({
    collection: 'loyalty-points',
    data: { customer: customerId, pointsBalance: 0, totalEarned: 0, totalSpent: 0, level: 'bronze', referralCode: generateReferralCode(), isEnabled: true },
  })
}

export async function getCustomerLoyaltySummary(customerId: number | string): Promise<LoyaltySummary | null> {
  const settings = await getSettings()
  if (!settings.isActive) return null
  const record = await getOrCreateLoyaltyRecord(customerId) as any
  if (!record.isEnabled) return null
  const levelInfo = calculateLevel(record.totalEarned, settings)
  return {
    id: record.id, customerId, pointsBalance: record.pointsBalance, totalEarned: record.totalEarned, totalSpent: record.totalSpent,
    level: levelInfo.level, levelMultiplier: levelInfo.multiplier, referralCode: record.referralCode, referredBy: record.referredBy || null,
    nextLevel: levelInfo.nextLevel, pointsToNextLevel: levelInfo.pointsToNextLevel, progressPercent: levelInfo.progressPercent, isEnabled: record.isEnabled,
  }
}

export async function awardWelcomeBonus(customerId: number | string): Promise<void> {
  const settings = await getSettings()
  if (!settings.isActive || settings.welcomeBonus <= 0) return
  const payload = await getPayload({ config })
  const record = await getOrCreateLoyaltyRecord(customerId) as any
  const existingWelcome = await payload.find({ collection: 'loyalty-transactions', where: { customer: { equals: customerId }, transactionType: { equals: 'welcome' } }, limit: 1 })
  if (existingWelcome.docs.length > 0) return
  const newBalance = record.pointsBalance + settings.welcomeBonus
  await payload.update({ collection: 'loyalty-points', id: record.id, data: { pointsBalance: newBalance, totalEarned: record.totalEarned + settings.welcomeBonus } })
  await payload.create({ collection: 'loyalty-transactions', data: { customer: customerId, transactionType: 'welcome', pointsAmount: settings.welcomeBonus, description: 'Welcome бонус за реєстрацію', balanceAfter: newBalance } })
}

export async function earnPointsFromOrder(customerId: number | string, orderId: string, orderTotal: number): Promise<number> {
  const settings = await getSettings()
  if (!settings.isActive) return 0
  const record = await getOrCreateLoyaltyRecord(customerId) as any
  if (!record.isEnabled) return 0
  const levelInfo = calculateLevel(record.totalEarned, settings)
  const points = Math.floor(Math.floor(orderTotal * settings.pointsPerUah) * levelInfo.multiplier)
  if (points <= 0) return 0
  const payload = await getPayload({ config })
  const newBalance = record.pointsBalance + points
  const newTotalEarned = record.totalEarned + points
  const newLevelInfo = calculateLevel(newTotalEarned, settings)
  await payload.update({ collection: 'loyalty-points', id: record.id, data: { pointsBalance: newBalance, totalEarned: newTotalEarned, level: newLevelInfo.level } })
  await payload.create({ collection: 'loyalty-transactions', data: { customer: customerId, transactionType: 'earned', pointsAmount: points, orderId, description: `Бали за замовлення (x${levelInfo.multiplier})`, balanceAfter: newBalance } })
  return points
}

export async function spendPointsOnOrder(customerId: number | string, orderId: string, pointsToSpend: number, orderTotal: number): Promise<number> {
  const settings = await getSettings()
  if (!settings.isActive) return 0
  const record = await getOrCreateLoyaltyRecord(customerId) as any
  if (!record.isEnabled) return 0
  const maxSpendable = Math.floor(orderTotal * settings.maxSpendPercentage)
  const actualSpend = Math.min(pointsToSpend, record.pointsBalance, maxSpendable)
  if (actualSpend <= 0) return 0
  const discount = actualSpend * settings.pointValue
  const payload = await getPayload({ config })
  const newBalance = record.pointsBalance - actualSpend
  await payload.update({ collection: 'loyalty-points', id: record.id, data: { pointsBalance: newBalance, totalSpent: record.totalSpent + actualSpend } })
  await payload.create({ collection: 'loyalty-transactions', data: { customer: customerId, transactionType: 'spent', pointsAmount: -actualSpend, orderId, description: `Списано на замовлення (-${discount} грн)`, balanceAfter: newBalance } })
  return discount
}

export async function awardReferralBonus(customerId: number | string, referralCode: string): Promise<void> {
  const settings = await getSettings()
  if (!settings.isActive || settings.referralBonus <= 0) return
  const payload = await getPayload({ config })
  const record = await getOrCreateLoyaltyRecord(customerId) as any
  if (record.referralCode === referralCode) throw new Error('Не можна використати власний код')
  if (record.referredBy) throw new Error('Ви вже використали реферальний код')
  const referrer = await payload.find({ collection: 'loyalty-points', where: { referralCode: { equals: referralCode } }, limit: 1 })
  if (!referrer.docs[0]) throw new Error('Код не знайдено')
  const referrerRecord = referrer.docs[0] as any
  const newBalance = record.pointsBalance + settings.referralBonus
  await payload.update({ collection: 'loyalty-points', id: record.id, data: { pointsBalance: newBalance, totalEarned: record.totalEarned + settings.referralBonus, referredBy: referralCode } })
  await payload.create({ collection: 'loyalty-transactions', data: { customer: customerId, transactionType: 'referral', pointsAmount: settings.referralBonus, description: 'Реферальний бонус', balanceAfter: newBalance } })
  const refNewBalance = referrerRecord.pointsBalance + settings.referralBonus
  await payload.update({ collection: 'loyalty-points', id: referrerRecord.id, data: { pointsBalance: refNewBalance, totalEarned: referrerRecord.totalEarned + settings.referralBonus } })
  await payload.create({ collection: 'loyalty-transactions', data: { customer: referrerRecord.customer, transactionType: 'referral', pointsAmount: settings.referralBonus, description: 'Реферальний бонус за запрошення друга', balanceAfter: refNewBalance } })
}

export async function adjustPoints(customerId: number | string, amount: number, description: string): Promise<void> {
  const payload = await getPayload({ config })
  const record = await getOrCreateLoyaltyRecord(customerId) as any
  const newBalance = record.pointsBalance + amount
  if (newBalance < 0) throw new Error('Insufficient points')
  const updateData: Record<string, any> = { pointsBalance: newBalance }
  if (amount > 0) updateData.totalEarned = record.totalEarned + amount
  else updateData.totalSpent = record.totalSpent + Math.abs(amount)
  await payload.update({ collection: 'loyalty-points', id: record.id, data: updateData })
  await payload.create({ collection: 'loyalty-transactions', data: { customer: customerId, transactionType: 'adjustment', pointsAmount: amount, description, balanceAfter: newBalance } })
}

export function calculatePointsFromOrder(orderTotal: number, level: string): number {
  const multipliers: Record<string, number> = { bronze: 1.0, silver: 1.05, gold: 1.1 }
  return Math.floor(orderTotal * 0.1 * (multipliers[level] || 1.0))
}

export function calculateMaxSpendablePoints(orderTotal: number, currentBalance: number): number {
  return Math.min(Math.floor(orderTotal * 0.3), currentBalance)
}

export async function getTransactionHistory(customerId: number | string, limit: number = 20, offset: number = 0): Promise<{ transactions: LoyaltyTransaction[]; count: number }> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'loyalty-transactions', where: { customer: { equals: customerId } }, sort: '-createdAt', limit, page: Math.floor(offset / limit) + 1 })
  return {
    transactions: result.docs.map((doc: any) => ({ id: doc.id, customer: doc.customer, transactionType: doc.transactionType, pointsAmount: doc.pointsAmount, orderId: doc.orderId || null, description: doc.description || null, balanceAfter: doc.balanceAfter, createdAt: doc.createdAt })),
    count: result.totalDocs,
  }
}

export async function getAllCustomers(limit: number = 20, offset: number = 0, _search?: string): Promise<{ customers: any[]; count: number }> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'loyalty-points', limit, page: Math.floor(offset / limit) + 1, depth: 1, sort: '-pointsBalance' })
  return { customers: result.docs, count: result.totalDocs }
}

export async function getAllTransactions(limit: number = 20, offset: number = 0): Promise<{ transactions: LoyaltyTransaction[]; count: number }> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'loyalty-transactions', sort: '-createdAt', limit, page: Math.floor(offset / limit) + 1, depth: 1 })
  return {
    transactions: result.docs.map((doc: any) => ({ id: doc.id, customer: doc.customer, transactionType: doc.transactionType, pointsAmount: doc.pointsAmount, orderId: doc.orderId || null, description: doc.description || null, balanceAfter: doc.balanceAfter, createdAt: doc.createdAt })),
    count: result.totalDocs,
  }
}

export async function getStats() {
  const payload = await getPayload({ config })
  const all = await payload.find({ collection: 'loyalty-points', limit: 0 })
  const docs = all.docs as any[]
  return {
    totalCustomers: all.totalDocs,
    totalPointsIssued: docs.reduce((sum, d) => sum + (d.totalEarned || 0), 0),
    totalPointsSpent: docs.reduce((sum, d) => sum + (d.totalSpent || 0), 0),
    activeCustomers: docs.filter((d) => d.isEnabled).length,
  }
}
