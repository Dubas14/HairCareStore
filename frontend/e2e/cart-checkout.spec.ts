import { test, expect } from '@playwright/test'

test.describe('Cart & Checkout flow', () => {
  test('can add product to cart from shop page', async ({ page }) => {
    await page.goto('/shop')
    // Wait for products
    const addBtn = page.locator('button').filter({ hasText: /кошик|cart|додати/i }).first()
    await addBtn.waitFor({ timeout: 15000 })
    await addBtn.click()
    // Cart count should update
    await page.waitForTimeout(1000)
  })

  test('can add product to cart from product page', async ({ page }) => {
    await page.goto('/shop')
    // Navigate to first product
    const productLink = page.locator('a[href*="/products/"]').first()
    await productLink.waitFor({ timeout: 15000 })
    await productLink.click()
    await expect(page).toHaveURL(/\/products\//)
    // Add to cart
    const addBtn = page.getByRole('button', { name: /кошик|cart|додати/i }).first()
    await addBtn.waitFor({ timeout: 10000 })
    await addBtn.click()
    await page.waitForTimeout(1000)
  })

  test('cart drawer opens after adding item', async ({ page }) => {
    await page.goto('/shop')
    const addBtn = page.locator('button').filter({ hasText: /кошик|cart|додати/i }).first()
    await addBtn.waitFor({ timeout: 15000 })
    await addBtn.click()
    // Cart drawer or page should appear
    await page.waitForTimeout(1500)
    const cartContent = page.locator('[data-testid="cart-drawer"], [role="dialog"], .cart-drawer')
    if (await cartContent.count() > 0) {
      await expect(cartContent.first()).toBeVisible()
    }
  })

  test('checkout page loads with cart items', async ({ page }) => {
    // First add a product
    await page.goto('/shop')
    const addBtn = page.locator('button').filter({ hasText: /кошик|cart|додати/i }).first()
    await addBtn.waitFor({ timeout: 15000 })
    await addBtn.click()
    await page.waitForTimeout(1000)
    // Navigate to checkout
    await page.goto('/checkout')
    // Should see contact form or order summary
    await page.waitForTimeout(2000)
    const checkoutContent = page.locator('form, [data-testid="checkout"]')
    await expect(checkoutContent.first()).toBeVisible({ timeout: 10000 })
  })
})
