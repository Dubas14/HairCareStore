/**
 * Setup Product Variants with different volumes
 *
 * Run: npx medusa exec ./src/scripts/setup-product-variants.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

// Варіанти об'ємів та множники цін
const VOLUME_VARIANTS = [
  { title: "250 мл", sku_suffix: "-250", price_multiplier: 1.0 },
  { title: "500 мл", sku_suffix: "-500", price_multiplier: 1.8 },
  { title: "1000 мл", sku_suffix: "-1000", price_multiplier: 3.2 },
]

// Товари які вже мають великий об'єм (1000мл) - не додавати варіанти
const LARGE_VOLUME_HANDLES = [
  "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-1000-ml",
  "shampun-tonuiuchyi-inebrya-grey-by-day-shampoo-1000-ml",
  "shampun-proty-lupy-inebrya-cleany-shampoo-1000-ml",
  "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-1000-ml",
]

// Товари без варіантів об'єму (стайлінг, флюїди - один розмір)
const SINGLE_VARIANT_HANDLES = [
  "fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml",
  "pasta-dlia-modeliuvannia-inebrya-flossy-paste-100-ml",
]

// База цін для товарів (з seed-products.ts)
const BASE_PRICES: Record<string, number> = {
  "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-250-ml": 529,
  "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-400-ml": 436,
  "fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml": 644,
  "shampun-proty-vypadinnia-volossia-inebrya-energy-shampoo-300-ml": 313,
  "termosprei-dlia-ukladannia-volossia-nevitaly-flawless-spray-150-ml": 1185,
  "termozakhysnyi-sprei-inebrya-thermo-spray-250-ml": 644,
  "sprei-dlia-dodannia-obiemu-15v1-inebrya-volume-one-spray-200-ml": 696,
  "pasta-dlia-modeliuvannia-inebrya-flossy-paste-100-ml": 791,
}

export default async function setupProductVariants({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)
  const pricingModule = container.resolve(Modules.PRICING)
  const regionModule = container.resolve(Modules.REGION)

  logger.info("🚀 Setting up product variants...")

  // Get region for currency
  const [region] = await regionModule.listRegions({})
  const currencyCode = region?.currency_code || "uah"
  logger.info(`Using currency: ${currencyCode}`)

  // Get all products with variants
  const products = await productModule.listProducts({}, {
    relations: ["variants", "options"],
  })

  logger.info(`Found ${products.length} products\n`)

  // Get prices via query
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  let updatedCount = 0
  let skippedCount = 0

  for (const product of products) {
    // Skip large volume products
    if (LARGE_VOLUME_HANDLES.includes(product.handle || "")) {
      logger.info(`⏭️  Skipping (large volume): ${product.title}`)
      skippedCount++
      continue
    }

    // Skip single variant products
    if (SINGLE_VARIANT_HANDLES.includes(product.handle || "")) {
      logger.info(`⏭️  Skipping (single variant): ${product.title}`)
      skippedCount++
      continue
    }

    // Skip if already has multiple variants
    if (product.variants && product.variants.length > 1) {
      logger.info(`⏭️  Skipping (already has variants): ${product.title}`)
      skippedCount++
      continue
    }

    try {
      // Get base price from predefined prices or default
      const basePrice = BASE_PRICES[product.handle || ""] || 500

      logger.info(`\n📦 Processing: ${product.title}`)
      logger.info(`   Base price: ${basePrice} ${currencyCode}`)

      // Delete existing variant(s) first
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          await productModule.deleteProductVariants([variant.id])
        }
        logger.info(`   🗑️  Deleted old variants`)
      }

      // Delete existing options
      if (product.options && product.options.length > 0) {
        for (const opt of product.options) {
          await productModule.deleteProductOptions([opt.id])
        }
        logger.info(`   🗑️  Deleted old options`)
      }

      // Create fresh option with all volume values
      await productModule.createProductOptions([
        {
          title: "Об'єм",
          product_id: product.id,
          values: VOLUME_VARIANTS.map(v => v.title),
        },
      ])
      logger.info(`   ✅ Created option: Об'єм`)

      // Create new variants with prices
      for (let i = 0; i < VOLUME_VARIANTS.length; i++) {
        const vol = VOLUME_VARIANTS[i]
        const variantPrice = Math.round(basePrice * vol.price_multiplier)
        // Generate short unique SKU: HAIR-{productIndex}-{volumeSuffix}
        const productIndex = products.indexOf(product) + 1
        const sku = `HAIR-${String(productIndex).padStart(3, "0")}${vol.sku_suffix}`

        const newVariant = await productModule.createProductVariants({
          product_id: product.id,
          title: vol.title,
          sku: sku,
          manage_inventory: false,
          options: {
            "Об'єм": vol.title,
          },
        })

        // Create price for variant
        await pricingModule.createPriceSets([
          {
            prices: [
              {
                amount: variantPrice,
                currency_code: currencyCode,
              },
            ],
          },
        ]).then(async (priceSets) => {
          // Link price set to variant
          const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
          await remoteLink.create({
            [Modules.PRODUCT]: {
              variant_id: newVariant.id,
            },
            [Modules.PRICING]: {
              price_set_id: priceSets[0].id,
            },
          })
        })

        logger.info(`   ✅ Created variant: ${vol.title} = ${variantPrice} ${currencyCode}`)
      }

      updatedCount++
    } catch (error) {
      logger.error(`   ❌ Error: ${error}`)
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  logger.info("\n" + "=".repeat(50))
  logger.info("✅ Variants setup complete!")
  logger.info("=".repeat(50))
  logger.info(`\nProducts updated: ${updatedCount}`)
  logger.info(`Products skipped: ${skippedCount}`)
  logger.info("\n📌 Check Admin → Products → select product → Variants")
}
