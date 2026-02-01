/**
 * Setup Price Lists and Promotions for HAIR LAB
 *
 * Run: npx medusa exec ./src/scripts/setup-pricing-promotions.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

// Товари на розпродаж з їх знижками (20%)
const SALE_PRODUCTS = [
  "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-1000-ml",
  "shampun-tonuiuchyi-inebrya-grey-by-day-shampoo-1000-ml",
  "shampun-proty-lupy-inebrya-cleany-shampoo-1000-ml",
  "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-1000-ml",
]

// Промокоди
const PROMOTIONS = [
  {
    code: "WELCOME15",
    description: "15% знижка для нових клієнтів",
    value: 15,
    target: "order" as const,
  },
  {
    code: "SALE10",
    description: "10% знижка на все замовлення",
    value: 10,
    target: "order" as const,
  },
  {
    code: "HAIRCARE20",
    description: "20% знижка на догляд за волоссям",
    value: 20,
    target: "order" as const,
  },
  {
    code: "FREESHIP",
    description: "Безкоштовна доставка",
    value: 100,
    target: "shipping_methods" as const,
  },
]

export default async function setupPricingPromotions({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pricingModule = container.resolve(Modules.PRICING)
  const promotionModule = container.resolve(Modules.PROMOTION)
  const productModule = container.resolve(Modules.PRODUCT)
  const regionModule = container.resolve(Modules.REGION)

  logger.info("🚀 Setting up pricing and promotions for HAIR LAB...")

  // Get region and currency
  const [region] = await regionModule.listRegions({})
  const currencyCode = region?.currency_code || "uah"

  // ============================================
  // 1. CREATE PRICE LIST FOR SALE ITEMS
  // ============================================
  logger.info("\n💰 Creating Sale Price List...")

  try {
    // Check if price list exists
    const existingPriceLists = await pricingModule.listPriceLists({})
    const existingSale = existingPriceLists.find(pl => pl.title === "Розпродаж -20%")

    let priceListId: string

    if (existingSale) {
      logger.info("  ⏭️  Price List 'Розпродаж -20%' already exists")
      priceListId = existingSale.id
    } else {
      // Create new price list
      const priceList = await pricingModule.createPriceLists([
        {
          title: "Розпродаж -20%",
          description: "Знижка 20% на товари великого об'єму",
          type: "sale",
          status: "active",
        },
      ])
      priceListId = priceList[0].id
      logger.info(`  ✅ Created Price List: Розпродаж -20%`)
    }

    // Add sale prices for products
    logger.info("\n  Adding sale prices to products...")

    for (const handle of SALE_PRODUCTS) {
      const products = await productModule.listProducts(
        { handle },
        { relations: ["variants"] }
      )

      if (products.length === 0) continue

      const product = products[0]

      for (const variant of product.variants || []) {
        // Get current price set for variant
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data: variantData } = await query.graph({
          entity: "product_variant",
          fields: ["id", "price_set.id", "price_set.prices.*"],
          filters: { id: variant.id },
        })

        const priceSetId = (variantData as any)?.[0]?.price_set?.id
        const currentPrice = (variantData as any)?.[0]?.price_set?.prices?.[0]?.amount

        if (priceSetId && currentPrice) {
          const salePrice = Math.round(currentPrice * 0.8) // 20% off

          try {
            await pricingModule.addPriceListPrices([
              {
                price_list_id: priceListId,
                prices: [
                  {
                    amount: salePrice,
                    currency_code: currencyCode,
                    price_set_id: priceSetId,
                  },
                ],
              },
            ])
            logger.info(`    ✅ ${product.title}: ${currentPrice} → ${salePrice} ${currencyCode}`)
          } catch (e) {
            // Price might already exist
            logger.info(`    ⏭️  ${product.title}: price already set`)
          }
        }
      }
    }
  } catch (error) {
    logger.error(`  ❌ Error creating price list: ${error}`)
  }

  // ============================================
  // 2. CREATE PROMOTIONS (PROMO CODES)
  // ============================================
  logger.info("\n🎟️  Creating Promotions (Promo Codes)...")

  for (const promo of PROMOTIONS) {
    try {
      // Check if promotion exists
      const existing = await promotionModule.listPromotions({
        code: promo.code,
      })

      if (existing.length > 0) {
        logger.info(`  ⏭️  Promotion "${promo.code}" already exists`)
        continue
      }

      // Create promotion with string literals
      await promotionModule.createPromotions([
        {
          code: promo.code,
          type: "standard",
          status: "active",
          is_automatic: false,
          application_method: {
            type: "percentage",
            target_type: promo.target,
            allocation: "across",
            value: promo.value,
          },
        },
      ])

      logger.info(`  ✅ Created promotion: ${promo.code} - ${promo.description}`)
    } catch (error) {
      logger.error(`  ❌ Error creating promotion "${promo.code}": ${error}`)
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  logger.info("\n" + "=".repeat(50))
  logger.info("✅ Pricing and Promotions setup complete!")
  logger.info("=".repeat(50))
  logger.info("\n📌 Price List:")
  logger.info("   Admin → Settings → Price Lists")
  logger.info("\n📌 Promotions:")
  logger.info("   Admin → Promotions")
  logger.info("\n🎟️  Available promo codes:")
  for (const promo of PROMOTIONS) {
    logger.info(`   • ${promo.code} - ${promo.description}`)
  }
}
