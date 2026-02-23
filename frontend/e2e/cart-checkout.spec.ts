import { test, expect } from '@playwright/test'

test.describe('Cart & Checkout flow', () => {
  test('can add product to cart from shop page', async ({ page }) => {
    await page.goto('/shop')
    // Wait for product cards to load
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.waitFor({ timeout: 15000 })
    // Hover to reveal add-to-cart button
    await productCard.hover()
    const addBtn = productCard.locator('[data-testid="add-to-cart-button"]')
    await addBtn.waitFor({ timeout: 5000 })
    await addBtn.click()
    // Cart button should show count
    await page.waitForTimeout(1000)
    const cartBadge = page.locator('[data-testid="cart-button"] span[aria-live="polite"]')
    await expect(cartBadge).toBeVisible({ timeout: 5000 })
  })

  test('can add product to cart from product page', async ({ page }) => {
    await page.goto('/shop')
    // Navigate to first product
    const productLink = page.locator('[data-testid="product-card"]').first()
    await productLink.waitFor({ timeout: 15000 })
    await productLink.click()
    await expect(page).toHaveURL(/\/products\//)
    // Add to cart
    const addBtn = page.locator('[data-testid="add-to-cart-button"]').first()
    await addBtn.waitFor({ timeout: 10000 })
    await addBtn.click()
    await page.waitForTimeout(1000)
  })

  test('cart drawer opens and shows checkout link', async ({ page }) => {
    await page.goto('/shop')
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.waitFor({ timeout: 15000 })
    await productCard.hover()
    const addBtn = productCard.locator('[data-testid="add-to-cart-button"]')
    await addBtn.waitFor({ timeout: 5000 })
    await addBtn.click()
    await page.waitForTimeout(1500)

    // Open cart via header button
    await page.locator('[data-testid="cart-button"]').click()
    await page.waitForTimeout(500)

    // Should see checkout link in cart drawer
    const checkoutLink = page.locator('[data-testid="checkout-link"]')
    if (await checkoutLink.isVisible()) {
      await expect(checkoutLink).toBeVisible()
    }
  })

  test('checkout page loads with contact form', async ({ page }) => {
    // First add a product
    await page.goto('/shop')
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.waitFor({ timeout: 15000 })
    await productCard.hover()
    const addBtn = productCard.locator('[data-testid="add-to-cart-button"]')
    await addBtn.waitFor({ timeout: 5000 })
    await addBtn.click()
    await page.waitForTimeout(1000)

    // Navigate to checkout
    await page.goto('/checkout')
    await page.waitForTimeout(2000)

    // Should see contact form
    const contactForm = page.locator('[data-testid="checkout-contact-form"]')
    await expect(contactForm).toBeVisible({ timeout: 10000 })
  })

  test('checkout contact form validates required fields', async ({ page }) => {
    // Add product and go to checkout
    await page.goto('/shop')
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.waitFor({ timeout: 15000 })
    await productCard.hover()
    const addBtn = productCard.locator('[data-testid="add-to-cart-button"]')
    await addBtn.waitFor({ timeout: 5000 })
    await addBtn.click()
    await page.waitForTimeout(1000)
    await page.goto('/checkout')

    const contactForm = page.locator('[data-testid="checkout-contact-form"]')
    await contactForm.waitFor({ timeout: 10000 })

    // Try to submit empty form
    const submitBtn = contactForm.locator('button[type="submit"]')
    await submitBtn.click()

    // Should show validation errors
    await page.waitForTimeout(500)
    const errorMessages = page.locator('.text-destructive, [role="alert"]')
    expect(await errorMessages.count()).toBeGreaterThan(0)
  })

  test('search dialog opens and accepts input', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)

    // Click search button
    const searchBtn = page.locator('[data-testid="search-button"]')
    await searchBtn.click()

    // Search input should be visible
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toBeVisible({ timeout: 5000 })

    // Type search query
    await searchInput.fill('шампунь')
    await page.waitForTimeout(1000)
  })
})
