/**
 * Create shipping option for Nova Poshta
 *
 * Run: npx medusa exec ./src/scripts/create-shipping-option.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { createShippingOptionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function createShippingOption({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)

  logger.info("Creating shipping option...")

  // 1. Get shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })

  if (!shippingProfiles?.length) {
    logger.error("No shipping profile found.")
    return
  }
  const shippingProfileId = shippingProfiles[0].id
  logger.info(`Shipping profile: ${shippingProfiles[0].name} (${shippingProfileId})`)

  // 2. Get fulfillment provider
  const fulfillmentProviders = await fulfillmentModule.listFulfillmentProviders({})
  const manualProvider = fulfillmentProviders.find(p => p.id.includes("manual"))

  if (!manualProvider) {
    logger.error("Manual fulfillment provider not found.")
    return
  }
  logger.info(`Provider: ${manualProvider.id}`)

  // 3. Get or create stock location
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
    logger.info(`Stock location: ${stockLocation.name} (${stockLocation.id})`)
  }

  // 4. Link stock location with fulfillment provider
  try {
    await remoteLink.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: manualProvider.id,
      },
    })
    logger.info(`Linked stock location to fulfillment provider`)
  } catch (e) {
    logger.info(`Link stock-provider already exists or error: ${(e as Error).message}`)
  }

  // 5. Create fulfillment set if not exists
  const fulfillmentSets = await fulfillmentModule.listFulfillmentSets({})
  let fulfillmentSet = fulfillmentSets.find(fs => fs.name === "Доставка")

  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: "Доставка",
      type: "shipping",
    })
    logger.info(`Created fulfillment set: ${fulfillmentSet.name} (${fulfillmentSet.id})`)
  } else {
    logger.info(`Fulfillment set: ${fulfillmentSet.name} (${fulfillmentSet.id})`)
  }

  // 6. Link fulfillment set to stock location
  try {
    await remoteLink.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    })
    logger.info(`Linked stock location to fulfillment set`)
  } catch (e) {
    logger.info(`Link stock-set already exists or error: ${(e as Error).message}`)
  }

  // 7. Create service zone if not exists
  const serviceZones = await fulfillmentModule.listServiceZones({
    fulfillment_set: {
      id: fulfillmentSet.id,
    },
  })
  let serviceZone = serviceZones.find(sz => sz.name === "Україна")

  if (!serviceZone) {
    serviceZone = await fulfillmentModule.createServiceZones({
      name: "Україна",
      fulfillment_set_id: fulfillmentSet.id,
      geo_zones: [
        {
          type: "country",
          country_code: "ua",
        },
      ],
    })
    logger.info(`Created service zone: ${serviceZone.name} (${serviceZone.id})`)
  } else {
    logger.info(`Service zone: ${serviceZone.name} (${serviceZone.id})`)
  }

  // 8. Check if shipping option exists
  const shippingOptions = await fulfillmentModule.listShippingOptions({
    service_zone: {
      id: serviceZone.id,
    },
  })
  const existingOption = shippingOptions.find(so => so.name === "Нова Пошта (відділення/поштомат)")

  if (existingOption) {
    logger.info(`Shipping option already exists: ${existingOption.name} (${existingOption.id})`)
    return
  }

  // 9. Create shipping option using workflow
  const { result } = await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Нова Пошта (відділення/поштомат)",
        service_zone_id: serviceZone.id,
        shipping_profile_id: shippingProfileId,
        provider_id: manualProvider.id,
        type: {
          label: "Нова Пошта",
          description: "Доставка 2-3 робочі дні",
          code: "nova-poshta",
        },
        price_type: "flat",
        prices: [
          {
            amount: 0, // За тарифами Нової Пошти (оплачується окремо)
            currency_code: "uah",
          },
        ],
      },
    ],
  })

  logger.info(`✅ Created shipping option: ${result[0].name} (${result[0].id})`)
  logger.info("")
  logger.info("✅ Shipping setup complete!")
}
