import type { SubscriberConfig, SubscriberArgs } from "@medusajs/framework"
import { LOYALTY_MODULE } from "../modules/loyalty"
import type LoyaltyModuleService from "../modules/loyalty/services/loyalty"
import { Modules } from "@medusajs/framework/utils"
import type { IOrderModuleService } from "@medusajs/framework/types"

/**
 * Award loyalty points when an order is placed
 */
export default async function orderPlacedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const loyaltyService = container.resolve<LoyaltyModuleService>(LOYALTY_MODULE)
  const orderService = container.resolve<IOrderModuleService>(Modules.ORDER)

  const orderId = event.data.id

  try {
    // Get order details
    const order = await orderService.retrieveOrder(orderId)

    // Only award points if order has a customer
    if (!order.customer_id) {
      console.log(`[Loyalty] Order ${orderId} has no customer, skipping points`)
      return
    }

    // Calculate total from order (in cents, convert to UAH)
    const orderTotal = typeof order.total === 'number' ? order.total / 100 : Number(order.total) / 100

    await loyaltyService.earnPointsFromOrder(
      order.customer_id,
      orderId,
      orderTotal
    )

    console.log(
      `[Loyalty] Points awarded for order ${orderId} to customer ${order.customer_id}`
    )
  } catch (error) {
    console.error(`[Loyalty] Failed to award points for order:`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
