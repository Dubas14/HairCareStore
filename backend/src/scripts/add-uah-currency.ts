/**
 * Add UAH currency to the store
 *
 * Run: npx medusa exec ./src/scripts/add-uah-currency.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"

export default async function addUahCurrency({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  logger.info("Adding UAH currency to the store...")

  // 1. Check if UAH exists in Currency Module
  const currencyModule = container.resolve(Modules.CURRENCY)

  try {
    const uah = await currencyModule.retrieveCurrency("uah")
    logger.info(`UAH currency found: ${uah.name} (${uah.symbol})`)
  } catch {
    logger.error("UAH currency not found in the system. It should be available by default.")
    return
  }

  // 2. Get the store
  const storeModule = container.resolve(Modules.STORE)
  const [store] = await storeModule.listStores({})

  if (!store) {
    logger.error("Store not found")
    return
  }
  logger.info(`Found store: ${store.name} (${store.id})`)

  // 3. Add UAH to supported currencies (set as default)
  try {
    // Check if UAH already exists
    const existingCurrencies = store.supported_currencies || []
    const hasUah = existingCurrencies.some((c: { currency_code: string }) => c.currency_code === "uah")

    if (hasUah) {
      logger.info("UAH already in store currencies")
    } else {
      // Add UAH as default, remove default from others
      const updatedCurrencies = existingCurrencies.map((c: { currency_code: string; is_default?: boolean }) => ({
        currency_code: c.currency_code,
        is_default: false, // Remove default from existing
      }))

      await storeModule.updateStores(store.id, {
        supported_currencies: [
          ...updatedCurrencies,
          {
            currency_code: "uah",
            is_default: true, // Set UAH as default
          },
        ],
      })
      logger.info("✅ UAH currency added to the store as default!")
    }
  } catch (error) {
    logger.error(`Failed to add UAH: ${error instanceof Error ? error.message : String(error)}`)
  }

  // 4. Now update the region to use UAH
  const regionModule = container.resolve(Modules.REGION)
  const [region] = await regionModule.listRegions({})

  if (region) {
    try {
      await regionModule.updateRegions(region.id, {
        currency_code: "uah",
      })
      logger.info(`✅ Region "${region.name}" updated to use UAH!`)
    } catch (error) {
      logger.error(`Failed to update region: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
