'use server'

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

  const payload = await getPayload({ config })

  try {
    const result = await payload.login({
      collection: 'customers',
      data: { email, password },
    })

    if (!result.user) {
      recordAttempt(ip, 'login')
      throw new Error('Невірний email або пароль')
    }

    resetAttempts(ip, 'login')
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

  try {
    await payload.create({
      collection: 'customers',
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    })

    // Auto-login after registration
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

      // Send welcome email (fire-and-forget)
      import('@/lib/email/email-actions')
        .then(({ sendWelcomeEmail }) => sendWelcomeEmail(data.email, data.firstName))
        .catch((err) => log.error('Welcome email failed', err))
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
