import { model } from "@medusajs/framework/utils"

export const LoyaltyPoints = model.define("loyalty_points", {
  id: model.id().primaryKey(),
  customer_id: model.text().unique(),
  points_balance: model.number().default(0),
  total_earned: model.number().default(0),
  total_spent: model.number().default(0),
  level: model.enum(["bronze", "silver", "gold"]).default("bronze"),
  referral_code: model.text().unique(),
  referred_by: model.text().nullable(),
})
