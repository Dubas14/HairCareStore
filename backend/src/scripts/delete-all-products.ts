/**
 * Delete all products
 *
 * Run: npx medusa exec ./src/scripts/delete-all-products.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function deleteAllProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info("Deleting all products...")

  const products = await productModule.listProducts({})

  if (products.length === 0) {
    logger.info("No products to delete")
    return
  }

  logger.info(`Found ${products.length} products to delete`)

  for (const product of products) {
    await productModule.deleteProducts([product.id])
    logger.info(`Deleted: ${product.title}`)
  }

  logger.info(`✅ Deleted ${products.length} products`)
}
