/**
 * Setup Categories and Collections for HAIR LAB
 *
 * Run: npx medusa exec ./src/scripts/setup-categories-collections.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

// Категорії товарів
const CATEGORIES = [
  { name: "Шампуні", handle: "shampuni", description: "Професійні шампуні для всіх типів волосся" },
  { name: "Кондиціонери", handle: "kondytsionery", description: "Кондиціонери та бальзами для волосся" },
  { name: "Маски", handle: "masky", description: "Інтенсивні маски для відновлення волосся" },
  { name: "Сироватки та флюїди", handle: "syrovatky-fluidy", description: "Сироватки, флюїди та олії для волосся" },
  { name: "Спреї", handle: "sprei", description: "Спреї для догляду та захисту волосся" },
  { name: "Стайлінг", handle: "stailing", description: "Засоби для укладання волосся" },
]

// Колекції (маркетингові групи)
const COLLECTIONS = [
  { title: "Бестселери", handle: "bestsellers" },
  { title: "Новинки", handle: "new-arrivals" },
  { title: "Розпродаж", handle: "sale" },
]

// Правила для автоматичного призначення категорій
const CATEGORY_RULES: Record<string, string[]> = {
  "shampuni": ["шампунь", "shampoo"],
  "kondytsionery": ["кондиціонер", "conditioner", "бальзам"],
  "masky": ["маска", "mask"],
  "syrovatky-fluidy": ["флюїд", "fluid", "сироватка", "serum", "олія", "oil", "crystal"],
  "sprei": ["спрей", "spray"],
  "stailing": ["паста", "paste", "гель", "gel", "віск", "wax", "мус", "mousse", "лак"],
}

// Правила для колекцій (на основі seed-products.ts)
const COLLECTION_PRODUCT_HANDLES: Record<string, string[]> = {
  "bestsellers": [
    "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-250-ml",
    "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-400-ml",
    "fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml",
    "shampun-proty-vypadinnia-volossia-inebrya-energy-shampoo-300-ml",
  ],
  "new-arrivals": [
    "termosprei-dlia-ukladannia-volossia-nevitaly-flawless-spray-150-ml",
    "termozakhysnyi-sprei-inebrya-thermo-spray-250-ml",
    "sprei-dlia-dodannia-obiemu-15v1-inebrya-volume-one-spray-200-ml",
    "pasta-dlia-modeliuvannia-inebrya-flossy-paste-100-ml",
  ],
  "sale": [
    "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-1000-ml",
    "shampun-tonuiuchyi-inebrya-grey-by-day-shampoo-1000-ml",
    "shampun-proty-lupy-inebrya-cleany-shampoo-1000-ml",
    "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-1000-ml",
  ],
}

export default async function setupCategoriesCollections({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("🚀 Setting up categories and collections for HAIR LAB...")

  // ============================================
  // 1. CREATE CATEGORIES
  // ============================================
  logger.info("\n📁 Creating categories...")

  const createdCategories: Record<string, string> = {}

  for (const cat of CATEGORIES) {
    try {
      // Check if category exists
      const existing = await productModule.listProductCategories({
        handle: cat.handle,
      })

      if (existing.length > 0) {
        logger.info(`  ⏭️  Category "${cat.name}" already exists`)
        createdCategories[cat.handle] = existing[0].id
        continue
      }

      const created = await productModule.createProductCategories({
        name: cat.name,
        handle: cat.handle,
        description: cat.description,
        is_active: true,
        is_internal: false,
      })

      createdCategories[cat.handle] = created.id
      logger.info(`  ✅ Created category: ${cat.name}`)
    } catch (error) {
      logger.error(`  ❌ Failed to create category "${cat.name}": ${error}`)
    }
  }

  // ============================================
  // 2. CREATE COLLECTIONS
  // ============================================
  logger.info("\n📦 Creating collections...")

  const createdCollections: Record<string, string> = {}

  for (const col of COLLECTIONS) {
    try {
      // Check if collection exists
      const existing = await productModule.listProductCollections({
        handle: col.handle,
      })

      if (existing.length > 0) {
        logger.info(`  ⏭️  Collection "${col.title}" already exists`)
        createdCollections[col.handle] = existing[0].id
        continue
      }

      const created = await productModule.createProductCollections({
        title: col.title,
        handle: col.handle,
      })

      createdCollections[col.handle] = created.id
      logger.info(`  ✅ Created collection: ${col.title}`)
    } catch (error) {
      logger.error(`  ❌ Failed to create collection "${col.title}": ${error}`)
    }
  }

  // ============================================
  // 3. ASSIGN PRODUCTS TO CATEGORIES
  // ============================================
  logger.info("\n🏷️  Assigning products to categories...")

  const allProducts = await productModule.listProducts({}, {
    select: ["id", "title", "handle"],
  })

  logger.info(`  Found ${allProducts.length} products`)

  for (const product of allProducts) {
    const titleLower = product.title.toLowerCase()

    for (const [categoryHandle, keywords] of Object.entries(CATEGORY_RULES)) {
      const matches = keywords.some(keyword => titleLower.includes(keyword))

      if (matches && createdCategories[categoryHandle]) {
        try {
          await productModule.updateProducts(product.id, {
            category_ids: [createdCategories[categoryHandle]],
          })
          logger.info(`  ✅ ${product.title} → ${categoryHandle}`)
          break // Only assign to first matching category
        } catch (error) {
          logger.error(`  ❌ Failed to assign "${product.title}" to category: ${error}`)
        }
      }
    }
  }

  // ============================================
  // 4. ASSIGN PRODUCTS TO COLLECTIONS
  // ============================================
  logger.info("\n📚 Assigning products to collections...")

  for (const [collectionHandle, productHandles] of Object.entries(COLLECTION_PRODUCT_HANDLES)) {
    const collectionId = createdCollections[collectionHandle]
    if (!collectionId) continue

    for (const productHandle of productHandles) {
      const products = await productModule.listProducts({
        handle: productHandle,
      })

      if (products.length > 0) {
        try {
          await productModule.updateProducts(products[0].id, {
            collection_id: collectionId,
          })
          logger.info(`  ✅ ${products[0].title} → ${collectionHandle}`)
        } catch (error) {
          logger.error(`  ❌ Failed to assign to collection: ${error}`)
        }
      }
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  logger.info("\n" + "=".repeat(50))
  logger.info("✅ Setup complete!")
  logger.info("=".repeat(50))
  logger.info(`\nCategories created: ${Object.keys(createdCategories).length}`)
  logger.info(`Collections created: ${Object.keys(createdCollections).length}`)
  logger.info(`Products processed: ${allProducts.length}`)
  logger.info("\n📌 Next steps:")
  logger.info("  1. Go to Admin → Products → Categories to view categories")
  logger.info("  2. Go to Admin → Products → Collections to view collections")
  logger.info("  3. Edit individual products to adjust categories if needed")
}
