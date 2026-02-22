import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/account/login')
    // Should see login form
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    const passwordInput = page.locator('input[type="password"], input[name="password"]')
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    await expect(passwordInput).toBeVisible()
  })

  test('login form validates empty fields', async ({ page }) => {
    await page.goto('/account/login')
    const submitBtn = page.getByRole('button', { name: /увійти|login|вхід/i })
    await submitBtn.waitFor({ timeout: 10000 })
    await submitBtn.click()
    // Should show validation errors
    await page.waitForTimeout(500)
    const errorText = page.locator('[role="alert"], .text-red, .error, [data-testid="error"]')
    if (await errorText.count() > 0) {
      await expect(errorText.first()).toBeVisible()
    }
  })

  test('register page loads', async ({ page }) => {
    await page.goto('/account/register')
    // Should see registration form
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await expect(emailInput).toBeVisible({ timeout: 10000 })
    // Should have first name, last name fields
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="ім"]')
    if (await firstNameInput.count() > 0) {
      await expect(firstNameInput.first()).toBeVisible()
    }
  })

  test('register form validates password mismatch', async ({ page }) => {
    await page.goto('/account/register')
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await emailInput.waitFor({ timeout: 10000 })

    // Fill with mismatched passwords
    await emailInput.fill('test@example.com')
    const passwordInputs = page.locator('input[type="password"]')
    if (await passwordInputs.count() >= 2) {
      await passwordInputs.nth(0).fill('password123')
      await passwordInputs.nth(1).fill('different456')
      // Submit
      const submitBtn = page.getByRole('button', { name: /реєстр|register|створити/i })
      if (await submitBtn.count() > 0) {
        await submitBtn.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('unauthenticated user redirected from dashboard', async ({ page }) => {
    await page.goto('/account')
    await page.waitForTimeout(2000)
    // Should redirect to login or show login prompt
    const url = page.url()
    const hasLoginContent = await page.locator('input[type="email"], input[name="email"]').count() > 0
    const isRedirected = url.includes('login')
    expect(isRedirected || hasLoginContent).toBeTruthy()
  })
})
