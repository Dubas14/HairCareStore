import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../modules/loyalty"
import type LoyaltyModuleService from "../../../modules/loyalty/services/loyalty"

/**
 * GET /store/loyalty
 * Get customer loyalty summary (balance, level, referral code)
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  try {
    const customerId = (req as any).auth_context?.actor_id

    if (!customerId) {
      res.status(401).json({
        message: "Необхідна авторизація",
      })
      return
    }

    const loyaltyService = req.scope.resolve<LoyaltyModuleService>(LOYALTY_MODULE)
    const summary = await loyaltyService.getCustomerLoyaltySummary(customerId)
    res.json({ loyalty: summary })
  } catch (error: any) {
    console.error("Loyalty GET error:", error)
    res.status(500).json({
      message: error.message || "Помилка отримання даних лояльності",
    })
  }
}
