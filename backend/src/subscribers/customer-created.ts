import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework"
import { LOYALTY_MODULE } from "../modules/loyalty"
import type LoyaltyModuleService from "../modules/loyalty/services/loyalty"

/**
 * Award welcome bonus when a new customer is created
 */
export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const loyaltyService = container.resolve<LoyaltyModuleService>(LOYALTY_MODULE)

  const customerId = event.data.id

  try {
    await loyaltyService.awardWelcomeBonus(customerId)
    console.log(`[Loyalty] Welcome bonus awarded to customer ${customerId}`)
  } catch (error) {
    console.error(`[Loyalty] Failed to award welcome bonus:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
