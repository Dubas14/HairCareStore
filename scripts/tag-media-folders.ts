/**
 * One-time migration script: tag existing media files with folder values.
 *
 * Usage:
 *   cd frontend && npx tsx ../scripts/tag-media-folders.ts
 *
 * Maps filenames to folders based on naming patterns:
 *   - *-banner*, hero-*                    → banners
 *   - *-logo*                              → brands
 *   - cat-*                                → categories
 *   - affixx-*, elgon-*, kataloh-elgon-*,
 *     mood-*, nevitaly-*, inebrya-*,
 *     prays-*, novynky-*                   → products
 *   - everything else                      → other
 */

import { getPayload } from 'payload'
import config from '../frontend/payload.config'

type FolderValue = 'products' | 'banners' | 'brands' | 'categories' | 'blog' | 'other'

function detectFolder(filename: string): FolderValue {
  const lower = filename.toLowerCase()

  // Banners
  if (lower.includes('-banner') || lower.includes('_banner') || lower.startsWith('hero-') || lower.startsWith('hero_')) {
    return 'banners'
  }

  // Brand logos
  if (lower.includes('-logo') || lower.includes('_logo')) {
    return 'brands'
  }

  // Categories
  if (lower.startsWith('cat-') || lower.startsWith('cat_')) {
    return 'categories'
  }

  // Products (brand-specific naming patterns)
  const productPrefixes = [
    'affixx-', 'affixx_', 'affixx-ua_',
    'elgon-', 'elgon_', 'kataloh-elgon',
    'mood-', 'mood_',
    'nevitaly-', 'nevitaly_',
    'inebrya-', 'inebrya_',
    'prays-', 'prays_',
    'novynky-', 'novynky_',
  ]
  for (const prefix of productPrefixes) {
    if (lower.startsWith(prefix)) return 'products'
  }

  return 'other'
}

async function main() {
  console.log('Starting media folder tagging...\n')

  const payload = await getPayload({ config })

  // Fetch all media docs (paginate through)
  let page = 1
  let totalTagged = 0
  let totalSkipped = 0
  const folderStats: Record<string, number> = {}

  while (true) {
    const result = await payload.find({
      collection: 'media',
      page,
      limit: 100,
      depth: 0,
    })

    if (result.docs.length === 0) break

    for (const doc of result.docs) {
      const existing = (doc as any).folder
      if (existing) {
        totalSkipped++
        continue
      }

      const folder = detectFolder(doc.filename ?? '')
      folderStats[folder] = (folderStats[folder] ?? 0) + 1

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: { folder } as any,
      })
      totalTagged++
    }

    console.log(`  Processed page ${page} (${result.docs.length} docs)`)

    if (!result.hasNextPage) break
    page++
  }

  console.log('\n--- Results ---')
  console.log(`Tagged: ${totalTagged}`)
  console.log(`Skipped (already tagged): ${totalSkipped}`)
  console.log('\nFolder distribution:')
  for (const [folder, count] of Object.entries(folderStats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${folder}: ${count}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
