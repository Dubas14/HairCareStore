import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/services/loyalty"

interface CalculateBody {
  order_total: number
  points_to_spend?: number
}

/**
 * POST /store/loyalty/calculate
 * Calculate points that will be earned/can be spent for an order
 */
export const POST = async (
  req: MedusaRequest<CalculateBody>,
  res: MedusaResponse
): Promise<void> => {
  const customerId = (req as any).auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({
      message: "Необхідна авторизація",
    })
    return
  }

  const { order_total, points_to_spend = 0 } = req.body

  if (!order_total || order_total <= 0) {
    res.status(400).json({
      message: "Сума замовлення обов'язкова та має бути більше 0",
    })
    return
  }

  const loyaltyService = req.scope.resolve<LoyaltyModuleService>(LOYALTY_MODULE)

  try {
    const summary = await loyaltyService.getCustomerLoyaltySummary(customerId)
    const level = summary.level as "bronze" | "silver" | "gold"

    // Calculate points that will be earned
    const pointsToEarn = loyaltyService.calculatePointsFromOrder(order_total, level)

    // Calculate max spendable points
    const maxSpendable = loyaltyService.calculateMaxSpendablePoints(
      order_total,
      summary.pointsBalance
    )

    // Calculate actual discount
    const actualDiscount = Math.min(points_to_spend, maxSpendable)

    // Final order total after discount
    const finalTotal = order_total - actualDiscount

    res.json({
      currentBalance: summary.pointsBalance,
      level: summary.level,
      levelMultiplier: summary.levelMultiplier,
      pointsToEarn,
      maxSpendable,
      requestedSpend: points_to_spend,
      actualDiscount,
      finalTotal,
    })
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Помилка розрахунку балів",
    })
  }
}
