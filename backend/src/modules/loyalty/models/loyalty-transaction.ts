import { model } from "@medusajs/framework/utils"

export const LoyaltyTransaction = model.define("loyalty_transaction", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  transaction_type: model.enum([
    "earned",
    "spent",
    "expired",
    "welcome",
    "referral",
    "adjustment"
  ]),
  points_amount: model.number(),
  order_id: model.text().nullable(),
  description: model.text().nullable(),
  balance_after: model.number(),
})
.indexes([
  {
    on: ["customer_id"],
    name: "idx_loyalty_transaction_customer",
  },
  {
    on: ["order_id"],
    name: "idx_loyalty_transaction_order",
    where: "order_id IS NOT NULL",
  },
])
