/**
 * Seed script for HAIR LAB products
 *
 * Run: npx medusa exec ./src/scripts/seed-products.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

// Product data from home-data.ts
const productsData = [
  // Bestsellers
  {
    title: "Щоденний шампунь Yes Daily Everyday",
    handle: "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-250-ml",
    subtitle: "Elgon",
    description: "Професійний щоденний шампунь для всіх типів волосся. М'яко очищує, не пересушуючи волосся та шкіру голови.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily_Shampoo_250ml-2-2-228x228.jpg",
    images: ["https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily_Shampoo_250ml-2-2-500x500.jpg"],
    price: 529,
    collection: "bestsellers",
  },
  {
    title: "Шампунь регенеруючий Ultra Care Restoring",
    handle: "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-400-ml",
    subtitle: "MOOD",
    description: "Регенеруючий шампунь для пошкодженого волосся. Відновлює структуру волосся та надає блиску.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood%20Ultra%20Care%20Shampoo%20400%20ml-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood%20Ultra%20Care%20Shampoo%20400%20ml-500x500.png"],
    price: 436,
    collection: "bestsellers",
  },
  {
    title: "Флюїд для додання блиску Crystal Beauty",
    handle: "fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml",
    subtitle: "INEBRYA",
    description: "Флюїд для неймовірного блиску волосся. Не обтяжує, захищає від зовнішніх факторів.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Crystal%20Beauty%20100-228x228.jpg",
    images: ["https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Crystal%20Beauty%20100-500x500.jpg"],
    price: 644,
    collection: "bestsellers",
  },
  {
    title: "Шампунь проти випадіння Energy Shampoo",
    handle: "shampun-proty-vypadinnia-volossia-inebrya-energy-shampoo-300-ml",
    subtitle: "INEBRYA",
    description: "Шампунь проти випадіння волосся. Стимулює ріст та зміцнює волосяні фолікули.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/Inebria%202/Energy%202/Shampoo%20300%202-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/Inebria%202/Energy%202/Shampoo%20300%202-500x500.png"],
    price: 313,
    collection: "bestsellers",
  },
  // New arrivals
  {
    title: "Термоспрей для укладання Flawless Spray",
    handle: "termosprei-dlia-ukladannia-volossia-nevitaly-flawless-spray-150-ml",
    subtitle: "NEVITALY",
    description: "Термозахисний спрей для укладання. Захищає від високих температур до 230°C.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/NEVITALY/STYLING/flawless%20spray%20150ml-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/NEVITALY/STYLING/flawless%20spray%20150ml-500x500.png"],
    price: 1185,
    collection: "new",
    tags: ["Новинка"],
  },
  {
    title: "Термозахисний спрей Thermo Spray",
    handle: "termozakhysnyi-sprei-inebrya-thermo-spray-250-ml",
    subtitle: "INEBRYA",
    description: "Термозахисний спрей для волосся. Захищає від пошкоджень при використанні фену та праски.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Thermo%20Spray%20250-228x228.jpg",
    images: ["https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Thermo%20Spray%20250-500x500.jpg"],
    price: 644,
    collection: "new",
    tags: ["Новинка"],
  },
  {
    title: "Спрей для додання об'єму Volume One 15в1",
    handle: "sprei-dlia-dodannia-obiemu-15v1-inebrya-volume-one-spray-200-ml",
    subtitle: "INEBRYA",
    description: "Багатофункціональний спрей 15 в 1 для об'єму. Легка текстура, не обтяжує волосся.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/Inebria%202/Pro%20Volume%202/One%20200%202-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/Inebria%202/Pro%20Volume%202/One%20200%202-500x500.png"],
    price: 696,
    collection: "new",
    tags: ["Новинка"],
  },
  {
    title: "Паста для моделювання Flossy Paste",
    handle: "pasta-dlia-modeliuvannia-inebrya-flossy-paste-100-ml",
    subtitle: "INEBRYA",
    description: "Моделююча паста для волосся. Середня фіксація, матовий ефект.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Flossy%20Paste%20100-228x228.jpg",
    images: ["https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Flossy%20Paste%20100-500x500.jpg"],
    price: 791,
    collection: "new",
    tags: ["Новинка"],
  },
  // Sale
  {
    title: "Шампунь щоденний Yes Daily Everyday 1000 мл",
    handle: "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-1000-ml",
    subtitle: "Elgon",
    description: "Професійний щоденний шампунь для всіх типів волосся. Економічний об'єм 1000 мл.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily%202/Yes%20Daily%20Shampoo%201000ml-2-228x228.jpg",
    images: ["https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily%202/Yes%20Daily%20Shampoo%201000ml-2-500x500.jpg"],
    price: 1116,
    oldPrice: 1395,
    collection: "sale",
    tags: ["Знижка"],
  },
  {
    title: "Шампунь тонуючий Grey By Day 1000 мл",
    handle: "shampun-tonuiuchyi-inebrya-grey-by-day-shampoo-1000-ml",
    subtitle: "INEBRYA",
    description: "Тонуючий шампунь для сивого волосся. Нейтралізує жовтизну, надає сріблястого відтінку.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/Inebria%202/Grey%20By%20Day%202/Shampoo%201000%202-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/Inebria%202/Grey%20By%20Day%202/Shampoo%201000%202-500x500.png"],
    price: 876,
    oldPrice: 1095,
    collection: "sale",
    tags: ["Знижка"],
  },
  {
    title: "Шампунь проти лупи Cleany Shampoo 1000 мл",
    handle: "shampun-proty-lupy-inebrya-cleany-shampoo-1000-ml",
    subtitle: "INEBRYA",
    description: "Шампунь проти лупи з цинком. Ефективно бореться з лупою та заспокоює шкіру голови.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/Inebria%202/Cleany%202/Sampoo%201000%202-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/Inebria%202/Cleany%202/Sampoo%201000%202-500x500.png"],
    price: 495,
    oldPrice: 619,
    collection: "sale",
    tags: ["Знижка"],
  },
  {
    title: "Шампунь регенеруючий Ultra Care 1000 мл",
    handle: "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-1000-ml",
    subtitle: "MOOD",
    description: "Регенеруючий шампунь для пошкодженого волосся. Економічний об'єм для салонів.",
    thumbnail: "https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood_Ultra%20Care%20Shampoo%201000%20ml-228x228.png",
    images: ["https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood_Ultra%20Care%20Shampoo%201000%20ml-500x500.png"],
    price: 770,
    oldPrice: 963,
    collection: "sale",
    tags: ["Знижка"],
  },
]

export default async function seedProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  logger.info("Starting HAIR LAB product seed...")

  // 1. Get default sales channel
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const [defaultSalesChannel] = await salesChannelModule.listSalesChannels({
    name: "Default Sales Channel",
  })

  if (!defaultSalesChannel) {
    logger.error("Default Sales Channel not found. Please create one in Admin.")
    return
  }
  logger.info(`Using Sales Channel: ${defaultSalesChannel.name} (${defaultSalesChannel.id})`)

  // 2. Get default shipping profile
  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id", "name"],
  })

  if (!shippingProfiles?.length) {
    logger.error("No shipping profile found. Please create one in Admin.")
    return
  }
  const shippingProfileId = shippingProfiles[0].id
  logger.info(`Using Shipping Profile: ${shippingProfiles[0].name} (${shippingProfileId})`)

  // 3. Get region for pricing
  const regionModule = container.resolve(Modules.REGION)
  const [region] = await regionModule.listRegions({})

  if (!region) {
    logger.error("No region found. Please create a region in Admin (Settings → Regions).")
    return
  }
  // Use UAH if available, otherwise fallback to region currency
  const currencyCode = region.currency_code === "uah" ? "uah" : (region.currency_code || "eur")
  logger.info(`Using Region: ${region.name} (${region.id}), Currency: ${currencyCode}`)

  // 4. Prepare products data for workflow
  const productsToCreate = productsData.map((product, index) => ({
    title: product.title,
    handle: product.handle,
    subtitle: product.subtitle, // Brand name
    description: product.description,
    status: ProductStatus.PUBLISHED,
    thumbnail: product.thumbnail,
    images: product.images.map((url) => ({ url })),
    // tags removed - need to be created separately
    options: [
      {
        title: "Об'єм",
        values: ["Стандарт"],
      },
    ],
    variants: [
      {
        title: "Стандарт",
        sku: `HAIR-${String(index + 1).padStart(3, "0")}`,
        manage_inventory: false,
        prices: [
          {
            amount: product.price, // Medusa v2 stores prices in major units
            currency_code: currencyCode,
          },
        ],
        options: {
          "Об'єм": "Стандарт",
        },
      },
    ],
    sales_channels: [
      {
        id: defaultSalesChannel.id,
      },
    ],
  }))

  // 5. Create products using workflow
  try {
    const { result: createdProducts } = await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate,
      },
    })

    logger.info(`✅ Successfully seeded ${createdProducts.length} products!`)

    // Log created products
    createdProducts.forEach((p) => {
      logger.info(`  - ${p.title} (${p.handle})`)
    })
  } catch (error) {
    logger.error(`Failed to seed products: ${error instanceof Error ? error.message : String(error)}`)
    throw error
  }
}
