/**
 * Update product thumbnails with local image URLs
 * Run: npx medusa exec ./src/scripts/update-product-thumbnails.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

// Frontend URL (where images are served from)
const FRONTEND_URL = "http://localhost:3100"

// Product images mapping (product handle -> image path)
const productImages: Record<string, string> = {
  "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-250-ml": "/images/products/product-1.jpg",
  "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-400-ml": "/images/products/product-2.png",
  "fliuid-dlia-dodannia-blysku-inebrya-crystal-beauty-100-ml": "/images/products/product-3.jpg",
  "shampun-proty-vypadinnia-volossia-inebrya-energy-shampoo-300-ml": "/images/products/product-4.png",
  "termosprei-dlia-ukladannia-volossia-nevitaly-flawless-spray-150-ml": "/images/products/product-5.png",
  "termozakhysnyi-sprei-inebrya-thermo-spray-250-ml": "/images/products/product-6.jpg",
  "sprei-dlia-dodannia-obiemu-15v1-inebrya-volume-one-spray-200-ml": "/images/products/product-7.png",
  "pasta-dlia-modeliuvannia-inebrya-flossy-paste-100-ml": "/images/products/product-8.jpg",
  "shchodennyi-shampun-elgon-yes-daily-everyday-shampoo-1000-ml": "/images/products/product-9.jpg",
  "shampun-tonuiuchyi-inebrya-grey-by-day-shampoo-1000-ml": "/images/products/product-10.png",
  "shampun-proty-lupy-inebrya-cleany-shampoo-1000-ml": "/images/products/product-11.png",
  "shampun-reheneruiuchyi-mood-ultra-care-restoring-shampoo-1000-ml": "/images/products/product-12.png",
}

export default async function updateProductThumbnails({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)

  console.log("🖼️  Оновлення зображень продуктів\n")

  // Get all products
  const { products } = await productService.listProducts({}, {
    relations: ["images"],
  })

  console.log(`📦 Знайдено ${products.length} продуктів\n`)

  let updated = 0
  let skipped = 0

  for (const product of products) {
    const imagePath = productImages[product.handle]

    if (!imagePath) {
      // Try to find by partial match
      const matchingHandle = Object.keys(productImages).find(h =>
        product.handle?.includes(h.split('-').slice(0, 3).join('-')) ||
        h.includes(product.handle?.split('-').slice(0, 3).join('-') || '')
      )

      if (!matchingHandle) {
        console.log(`⏭️  ${product.title} (${product.handle}) - немає зображення`)
        skipped++
        continue
      }
    }

    const finalImagePath = imagePath || productImages[Object.keys(productImages)[0]]
    const imageUrl = `${FRONTEND_URL}${finalImagePath || '/images/products/product-1.jpg'}`

    try {
      await productService.updateProducts(product.id, {
        thumbnail: imageUrl,
        images: [{ url: imageUrl }],
      })

      console.log(`✅ ${product.title}`)
      updated++
    } catch (error: any) {
      console.log(`❌ ${product.title} - помилка: ${error.message}`)
    }
  }

  console.log(`\n========================================`)
  console.log(`✅ Оновлено: ${updated}`)
  console.log(`⏭️  Пропущено: ${skipped}`)
}
