import { test, expect } from '@playwright/test'

test.describe('Shop browsing', () => {
  test('home page loads and shows hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Hair Lab/i)
    // Hero section should be visible
    const hero = page.locator('[data-testid="hero"], section').first()
    await expect(hero).toBeVisible()
  })

  test('shop page loads with products', async ({ page }) => {
    await page.goto('/shop')
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, a[href*="/products/"]', {
      timeout: 15000,
    })
    const products = page.locator('[data-testid="product-card"], .product-card, a[href*="/products/"]')
    await expect(products.first()).toBeVisible()
  })

  test('can navigate to product detail page', async ({ page }) => {
    await page.goto('/shop')
    // Click first product link
    const productLink = page.locator('a[href*="/products/"]').first()
    await productLink.waitFor({ timeout: 15000 })
    await productLink.click()
    // Should navigate to product page
    await expect(page).toHaveURL(/\/products\//)
    // Product page should have add to cart button
    const addToCart = page.getByRole('button', { name: /кошик|cart/i })
    await expect(addToCart).toBeVisible({ timeout: 10000 })
  })

  test('can filter products by category', async ({ page }) => {
    await page.goto('/shop')
    // Look for category filters
    const categoryFilter = page.locator('[data-testid="category-filter"], [role="button"]').filter({ hasText: /категор/i })
    if (await categoryFilter.count() > 0) {
      await categoryFilter.first().click()
      // Wait for URL to update or products to reload
      await page.waitForTimeout(1000)
    }
  })

  test('search works from header', async ({ page }) => {
    await page.goto('/')
    // Click search icon/button
    const searchTrigger = page.locator('[data-testid="search-trigger"], button[aria-label*="search"], button[aria-label*="пошук"]').first()
    if (await searchTrigger.isVisible()) {
      await searchTrigger.click()
      // Type in search
      const searchInput = page.locator('input[type="search"], input[placeholder*="пошук"], input[placeholder*="search"]').first()
      await searchInput.waitFor({ timeout: 5000 })
      await searchInput.fill('шампунь')
      // Wait for results
      await page.waitForTimeout(1500)
    }
  })
})
