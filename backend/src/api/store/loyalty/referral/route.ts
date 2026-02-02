import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LOYALTY_MODULE } from "../../../../modules/loyalty"
import type LoyaltyModuleService from "../../../../modules/loyalty/services/loyalty"

interface ApplyReferralBody {
  referral_code: string
}

/**
 * POST /store/loyalty/referral
 * Apply a referral code to get bonus points
 */
export const POST = async (
  req: MedusaRequest<ApplyReferralBody>,
  res: MedusaResponse
): Promise<void> => {
  const customerId = (req as any).auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({
      message: "Необхідна авторизація",
    })
    return
  }

  const { referral_code } = req.body

  if (!referral_code) {
    res.status(400).json({
      message: "Реферальний код обов'язковий",
    })
    return
  }

  const loyaltyService = req.scope.resolve<LoyaltyModuleService>(LOYALTY_MODULE)

  try {
    await loyaltyService.awardReferralBonus(
      customerId,
      referral_code.toUpperCase()
    )
    const summary = await loyaltyService.getCustomerLoyaltySummary(customerId)

    res.json({
      message: "Реферальний код успішно застосовано! +200 балів",
      loyalty: summary,
    })
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Помилка застосування реферального коду",
    })
  }
}
