/**
 * Upload product images to Medusa local storage
 * Run: npx medusa exec ./src/scripts/upload-product-images.ts
 */

import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import * as fs from "fs"
import * as path from "path"

// Product images mapping (partial handle match -> image filename)
const productImageMap: { pattern: string; image: string }[] = [
  { pattern: "yes-daily", image: "product-1.jpg" },
  { pattern: "ultra-care", image: "product-2.png" },
  { pattern: "crystal-beauty", image: "product-3.jpg" },
  { pattern: "energy-shampoo", image: "product-4.png" },
  { pattern: "flawless-spray", image: "product-5.png" },
  { pattern: "thermo-spray", image: "product-6.jpg" },
  { pattern: "volume-one", image: "product-7.png" },
  { pattern: "flossy-paste", image: "product-8.jpg" },
  { pattern: "grey-by-day", image: "product-10.png" },
  { pattern: "cleany", image: "product-11.png" },
]

export default async function uploadProductImages({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT)

  // Images are already in /app/static (copied from frontend)
  const staticDir = "/app/static"

  console.log("🖼️  Оновлення зображень продуктів в Medusa\n")

  // List available images
  const availableImages = fs.existsSync(staticDir) ? fs.readdirSync(staticDir) : []
  console.log(`📁 Знайдено ${availableImages.length} зображень в ${staticDir}`)

  // Get all products
  const products = await productService.listProducts({})

  console.log(`📦 Знайдено ${products.length} продуктів\n`)

  let updated = 0
  let skipped = 0

  for (const product of products) {
    // Find matching image by pattern
    const match = productImageMap.find(m =>
      product.handle?.toLowerCase().includes(m.pattern.toLowerCase())
    )

    // Determine image filename
    let imageName: string | undefined

    if (match) {
      imageName = match.image
    } else {
      // Try to find any product-N image
      const idx = (skipped % 12) + 1
      const possibleNames = [`product-${idx}.jpg`, `product-${idx}.png`]
      imageName = possibleNames.find(name => availableImages.includes(name))
    }

    if (!imageName || !availableImages.includes(imageName)) {
      console.log(`⏭️  ${product.title} - зображення не знайдено`)
      skipped++
      continue
    }

    try {
      // Update product thumbnail with static URL
      const imageUrl = `/static/${imageName}`

      await productService.updateProducts(product.id, {
        thumbnail: imageUrl,
      })

      console.log(`✅ ${product.title} → ${imageName}`)
      updated++
    } catch (error: any) {
      console.log(`❌ ${product.title} - ${error.message}`)
    }
  }

  console.log(`\n========================================`)
  console.log(`✅ Оновлено: ${updated}`)
  console.log(`⏭️  Пропущено: ${skipped}`)
  console.log(`\n💡 Зображення доступні за URL: http://localhost:9100/static/...`)
}
