'use server'

import crypto from 'crypto'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { checkRateLimit, recordAttempt, resetAttempts } from '@/lib/rate-limiter'
import { loginSchema } from '@/lib/validations/schemas'
import { createLogger } from '@/lib/logger'
import { signCustomerId, verifyCustomerId } from '@/lib/auth/token-utils'

const log = createLogger('auth-actions')

async function getClientIP(): Promise<string> {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

const CUSTOMER_TOKEN_COOKIE = 'hair-lab-customer-token'

export async function loginCustomer(email: string, password: string) {
  // Server-side validation
  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Невірні дані')
  }

  const ip = await getClientIP()
  const rl = checkRateLimit(ip, 'login')
  if (!rl.allowed) {
    throw new Error(`Забагато спроб. Спробуйте через ${Math.ceil((rl.blockTime || 1800) / 60)} хв.`)
  }

  // Also rate-limit per email to prevent credential stuffing on specific accounts
  const emailKey = `email:${email.toLowerCase()}`
  const emailRl = checkRateLimit(emailKey, 'login')
  if (!emailRl.allowed) {
    throw new Error(`Забагато спроб для цього акаунту. Спробуйте через ${Math.ceil((emailRl.blockTime || 1800) / 60)} хв.`)
  }

  const payload = await getPayload({ config })

  try {
    const result = await payload.login({
      collection: 'customers',
      data: { email, password },
    })

    if (!result.user) {
      recordAttempt(ip, 'login')
      recordAttempt(emailKey, 'login')
      throw new Error('Невірний email або пароль')
    }

    resetAttempts(ip, 'login')
    resetAttempts(emailKey, 'login')
    const cookieStore = await cookies()
    cookieStore.set(CUSTOMER_TOKEN_COOKIE, signCustomerId(String(result.user.id)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return result.user
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith('Забагато')) throw err
    recordAttempt(ip, 'login')
    recordAttempt(emailKey, 'login')
    throw new Error('Невірний email або пароль')
  }
}

export async function registerCustomer(data: {
  email: string
  password: string
  firstName: string
  lastName: string
}) {
  // Server-side validation (reuse registerSchema without confirmPassword/acceptTerms)
  const parsed = loginSchema.safeParse({ email: data.email, password: data.password })
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || 'Невірні дані')
  }
  if (!data.firstName?.trim() || !data.lastName?.trim()) {
    throw new Error("Ім'я та прізвище обов'язкові")
  }

  const ip = await getClientIP()
  const rl = checkRateLimit(ip, 'register')
  if (!rl.allowed) {
    throw new Error(`Забагато спроб реєстрації. Спробуйте через ${Math.ceil((rl.blockTime || 3600) / 60)} хв.`)
  }
  recordAttempt(ip, 'register')

  const payload = await getPayload({ config })

  // Check if email already exists
  const existing = await payload.find({
    collection: 'customers',
    where: { email: { equals: data.email } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    throw new Error('Цей email вже зареєстрований. Увійдіть або відновіть пароль.')
  }

  try {
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await payload.create({
      collection: 'customers',
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires.toISOString(),
      },
    })

    // Auto-login after registration (allow browsing, but checkout requires verification)
    const loginResult = await payload.login({
      collection: 'customers',
      data: { email: data.email, password: data.password },
    })

    if (loginResult.user) {
      const cookieStore = await cookies()
      cookieStore.set(CUSTOMER_TOKEN_COOKIE, signCustomerId(String(loginResult.user.id)), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      })

      // Send verification email (fire-and-forget)
      import('@/lib/email/email-actions')
        .then(({ sendVerificationEmail }) => sendVerificationEmail(data.email, data.firstName, verificationToken))
        .catch((err) => log.error('Verification email failed', err))
    }

    return loginResult.user
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Помилка реєстрації'
    throw new Error(message)
  }
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value
  if (!token) return null

  const customerId = verifyCustomerId(token)
  if (!customerId) {
    cookieStore.delete(CUSTOMER_TOKEN_COOKIE)
    return null
  }

  try {
    const payload = await getPayload({ config })
    const customer = await payload.findByID({
      collection: 'customers',
      id: customerId,
      depth: 0,
    })

    return customer || null
  } catch {
    cookieStore.delete(CUSTOMER_TOKEN_COOKIE)
    return null
  }
}

export async function logoutCustomer() {
  const cookieStore = await cookies()
  cookieStore.delete(CUSTOMER_TOKEN_COOKIE)
  // Clear stale payload-token if it was set by the old auth system
  cookieStore.delete('payload-token')
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  if (!token || token.length < 32) {
    return { success: false, error: 'Невірне посилання для підтвердження' }
  }

  const payload = await getPayload({ config })

  const customers = await payload.find({
    collection: 'customers',
    where: { emailVerificationToken: { equals: token } },
    limit: 1,
  })

  if (customers.docs.length === 0) {
    return { success: false, error: 'Посилання для підтвердження недійсне або вже використане' }
  }

  const customer = customers.docs[0] as unknown as {
    id: number | string
    emailVerified?: boolean
    emailVerificationExpires?: string
  }

  if (customer.emailVerified) {
    return { success: true } // Already verified
  }

  // Check expiration
  if (customer.emailVerificationExpires) {
    const expires = new Date(customer.emailVerificationExpires)
    if (expires < new Date()) {
      return { success: false, error: 'Термін дії посилання закінчився. Запросіть новий лист.' }
    }
  }

  await payload.update({
    collection: 'customers',
    id: customer.id,
    data: {
      emailVerified: true,
      emailVerificationToken: '',
      emailVerificationExpires: '',
    },
  })

  // Send welcome email after successful verification (fire-and-forget)
  const verifiedCustomer = await payload.findByID({ collection: 'customers', id: customer.id })
  const typedCustomer = verifiedCustomer as unknown as { email: string; firstName: string }
  import('@/lib/email/email-actions')
    .then(({ sendWelcomeEmail }) => sendWelcomeEmail(typedCustomer.email, typedCustomer.firstName))
    .catch((err) => log.error('Welcome email failed', err))

  return { success: true }
}

export async function resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CUSTOMER_TOKEN_COOKIE)?.value
  if (!token) return { success: false, error: 'Увійдіть в акаунт' }

  const customerId = verifyCustomerId(token)
  if (!customerId) return { success: false, error: 'Сесія закінчилась' }

  const payload = await getPayload({ config })
  const customer = await payload.findByID({ collection: 'customers', id: customerId })
  if (!customer) return { success: false, error: 'Користувача не знайдено' }

  const typedCustomer = customer as unknown as {
    id: number | string
    email: string
    firstName: string
    emailVerified?: boolean
  }

  if (typedCustomer.emailVerified) {
    return { success: true } // Already verified
  }

  const newToken = crypto.randomBytes(32).toString('hex')
  const newExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await payload.update({
    collection: 'customers',
    id: typedCustomer.id,
    data: {
      emailVerificationToken: newToken,
      emailVerificationExpires: newExpires.toISOString(),
    },
  })

  try {
    const { sendVerificationEmail } = await import('@/lib/email/email-actions')
    await sendVerificationEmail(typedCustomer.email, typedCustomer.firstName, newToken)
    return { success: true }
  } catch (err) {
    log.error('Resend verification email failed', err)
    return { success: false, error: 'Не вдалося відправити лист' }
  }
}
