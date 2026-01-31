/**
 * Setup basic shipping infrastructure for the store
 * Detailed shipping options should be configured in Admin panel
 *
 * Run: npx medusa exec ./src/scripts/setup-shipping.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function setupShipping({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const regionModule = container.resolve(Modules.REGION)

  logger.info("Setting up shipping infrastructure...")

  // 1. Get region
  const [region] = await regionModule.listRegions({})
  if (!region) {
    logger.error("No region found. Please create a region first.")
    return
  }
  logger.info(`Found region: ${region.name} (${region.id})`)

  // 2. Get or create stock location
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  let [stockLocation] = await stockLocationModule.listStockLocations({})

  if (!stockLocation) {
    stockLocation = await stockLocationModule.createStockLocations({
      name: "Основний склад",
      address: {
        address_1: "вул. Хрещатик, 1",
        city: "Київ",
        country_code: "ua",
        postal_code: "01001",
      },
    })
    logger.info(`Created stock location: ${stockLocation.name} (${stockLocation.id})`)
  } else {
    logger.info(`Using existing stock location: ${stockLocation.name} (${stockLocation.id})`)
  }

  // 3. Check fulfillment providers
  const fulfillmentProviders = await fulfillmentModule.listFulfillmentProviders({})
  logger.info(`Available fulfillment providers: ${fulfillmentProviders.map(p => p.id).join(", ") || "none"}`)

  if (!fulfillmentProviders.length) {
    logger.error("No fulfillment providers found. Check medusa-config.ts")
    return
  }

  // 4. Check existing fulfillment sets
  const fulfillmentSets = await fulfillmentModule.listFulfillmentSets({})
  logger.info(`Existing fulfillment sets: ${fulfillmentSets.map(fs => fs.name).join(", ") || "none"}`)

  // 5. Check existing shipping options
  const shippingOptions = await fulfillmentModule.listShippingOptions({})
  logger.info(`Existing shipping options: ${shippingOptions.map(so => so.name).join(", ") || "none"}`)

  logger.info("")
  logger.info("✅ Shipping infrastructure check complete!")
  logger.info("")
  logger.info("To configure shipping options:")
  logger.info("1. Go to Admin Panel: http://localhost:9100/app")
  logger.info("2. Settings → Locations & Shipping")
  logger.info("3. Create/edit location and add shipping options")
  logger.info("")
  logger.info("Or use the Medusa Admin API to create shipping options programmatically.")
}
