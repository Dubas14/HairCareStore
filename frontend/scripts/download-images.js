/**
 * Download all external images and save locally
 * Run: node scripts/download-images.js
 */

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images')

// All images to download
const images = {
  // Hero slides (from unsplash)
  heroes: [
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&h=600&fit=crop', name: 'hero-1.jpg' },
    { url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1920&h=600&fit=crop', name: 'hero-2.jpg' },
    { url: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1920&h=600&fit=crop', name: 'hero-3.jpg' },
  ],
  // Categories (from unsplash)
  categories: [
    { url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', name: 'cat-shampoos.jpg' },
    { url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop', name: 'cat-conditioners.jpg' },
    { url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop', name: 'cat-masks.jpg' },
    { url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop', name: 'cat-hair-color.jpg' },
  ],
  // Products (from multicolor.ua)
  products: [
    { url: 'https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily_Shampoo_250ml-2-2-228x228.jpg', name: 'product-1.jpg' },
    { url: 'https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood%20Ultra%20Care%20Shampoo%20400%20ml-228x228.png', name: 'product-2.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Crystal%20Beauty%20100-228x228.jpg', name: 'product-3.jpg' },
    { url: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Energy%202/Shampoo%20300%202-228x228.png', name: 'product-4.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/NEVITALY/STYLING/flawless%20spray%20150ml-228x228.png', name: 'product-5.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Thermo%20Spray%20250-228x228.jpg', name: 'product-6.jpg' },
    { url: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Pro%20Volume%202/One%20200%202-228x228.png', name: 'product-7.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/INEBRYA/STYLING/Inebrya%20Flossy%20Paste%20100-228x228.jpg', name: 'product-8.jpg' },
    { url: 'https://multicolor.ua/image/cache/catalog/Elgon/Yes%20Daily%202/Yes%20Daily%20Shampoo%201000ml-2-228x228.jpg', name: 'product-9.jpg' },
    { url: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Grey%20By%20Day%202/Shampoo%201000%202-228x228.png', name: 'product-10.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/Inebria%202/Cleany%202/Sampoo%201000%202-228x228.png', name: 'product-11.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/MOOD/Ultra%20Care/Mood_Ultra%20Care%20Shampoo%201000%20ml-228x228.png', name: 'product-12.png' },
  ],
  // Brand logos (from multicolor.ua)
  brands: [
    { url: 'https://multicolor.ua/image/cache/catalog/%20Elgon%20Colorcare%20Delicate/Elgon-logo_black%20(1)-100x100.png', name: 'brand-elgon.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/INEBRYA/BALANCE/Inebrya-logo_black%20(1)-100x100.png', name: 'brand-inebrya.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/MOOD/Activator/Mood-logo_black%20(1)-100x100.png', name: 'brand-mood.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/NEVITALY/%20Cuddles%20Hand/Nevitaly-logo-01-100x100.png', name: 'brand-nevitaly.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/LINK%20D/LOGO%20LINK-D-100x100.png', name: 'brand-linkd.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/TREHD%20TOUJOURS/After%20color%20care/toujours-100x100.png', name: 'brand-toujours.png' },
    { url: 'https://multicolor.ua/image/cache/catalog/URBAN%20DOG/IMG_5295-100x100.PNG', name: 'brand-urbandog.png' },
  ],
}

// Create directories
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
}

// Download single image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`))
        return
      }

      const file = fs.createWriteStream(filepath)
      response.pipe(file)

      file.on('finish', () => {
        file.close()
        resolve(filepath)
      })

      file.on('error', (err) => {
        fs.unlink(filepath, () => {})
        reject(err)
      })
    })

    request.on('error', reject)
    request.setTimeout(30000, () => {
      request.destroy()
      reject(new Error(`Timeout for ${url}`))
    })
  })
}

// Main
async function main() {
  console.log('Downloading images for HAIR LAB...\n')

  // Create directories
  ensureDir(path.join(IMAGES_DIR, 'heroes'))
  ensureDir(path.join(IMAGES_DIR, 'categories'))
  ensureDir(path.join(IMAGES_DIR, 'products'))
  ensureDir(path.join(IMAGES_DIR, 'brands'))

  let success = 0
  let failed = 0

  // Download all images
  for (const [category, items] of Object.entries(images)) {
    console.log(`\nDownloading ${category}...`)

    for (const item of items) {
      const filepath = path.join(IMAGES_DIR, category, item.name)

      try {
        await downloadImage(item.url, filepath)
        console.log(`  ✓ ${item.name}`)
        success++
      } catch (err) {
        console.log(`  ✗ ${item.name}: ${err.message}`)
        failed++
      }
    }
  }

  console.log(`\n========================================`)
  console.log(`Done! Downloaded: ${success}, Failed: ${failed}`)
  console.log(`Images saved to: ${IMAGES_DIR}`)
  console.log(`\nNext: Update home-data.ts to use local paths`)
}

main().catch(console.error)
