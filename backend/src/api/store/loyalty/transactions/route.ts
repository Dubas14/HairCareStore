import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/services/loyalty"

/**
 * GET /store/loyalty/transactions
 * Get customer loyalty transaction history
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
  const customerId = (req as any).auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({
      message: "Необхідна авторизація",
    })
    return
  }

  const limit = parseInt(req.query.limit as string) || 20
  const offset = parseInt(req.query.offset as string) || 0

  const loyaltyService = req.scope.resolve<LoyaltyModuleService>(LOYALTY_MODULE)

  try {
    const result = await loyaltyService.getTransactionHistory(customerId, limit, offset)
    res.json(result)
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Помилка отримання історії транзакцій",
    })
  }
}
