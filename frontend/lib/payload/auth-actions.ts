'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import crypto from 'crypto'

const CUSTOMER_TOKEN_COOKIE = 'hair-lab-customer-token'

function getSecret(): string {
  return process.env.PAYLOAD_SECRET || 'default-secret-change-me-in-production'
}

const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function signCustomerId(customerId: string): string {
  const timestamp = Date.now().toString(36)
  const data = `${customerId}.${timestamp}`
  const hmac = crypto.createHmac('sha256', getSecret())
  hmac.update(data)
  const signature = hmac.digest('hex')
  return `${data}.${signature}`
}

function verifyCustomerId(value: string): string | null {
  const parts = value.split('.')
  if (parts.length !== 3) return null
  const [customerId, timestamp, signature] = parts

  // Verify HMAC
  const data = `${customerId}.${timestamp}`
  const hmac = crypto.createHmac('sha256', getSecret())
  hmac.update(data)
  const expectedSignature = hmac.digest('hex')
  if (signature !== expectedSignature) return null

  // Verify token age
  const tokenTime = parseInt(timestamp, 36)
  if (isNaN(tokenTime) || Date.now() - tokenTime > TOKEN_MAX_AGE_MS) return null

  return customerId
}

export async function loginCustomer(email: string, password: string) {
  const payload = await getPayload({ config })

  try {
    const result = await payload.login({
      collection: 'customers',
      data: { email, password },
    })

    if (!result.user) {
      throw new Error('Невірний email або пароль')
    }

    const cookieStore = await cookies()
    cookieStore.set(CUSTOMER_TOKEN_COOKIE, signCustomerId(String(result.user.id)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return result.user
  } catch {
    throw new Error('Невірний email або пароль')
  }
}

export async function registerCustomer(data: {
  email: string
  password: string
  firstName: string
  lastName: string
}) {
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
    }

    return loginResult.user
  } catch (error: any) {
    const message = error?.message || 'Помилка реєстрації'
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
