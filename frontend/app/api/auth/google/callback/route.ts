import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { signCustomerId } from '@/lib/auth/token-utils'
import { createLogger } from '@/lib/logger'
import {
  GOOGLE_TOKEN_URL,
  GOOGLE_USERINFO_URL,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_RETURN_COOKIE,
  getGoogleClientId,
  getGoogleClientSecret,
  getGoogleRedirectUri,
} from '@/lib/auth/google-oauth'

const log = createLogger('google-oauth')

const CUSTOMER_TOKEN_COOKIE = 'hair-lab-customer-token'

interface GoogleTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  given_name?: string
  family_name?: string
  picture?: string
}

function redirectWithError(baseUrl: string, error: string): NextResponse {
  return NextResponse.redirect(new URL(`/account/login?error=${encodeURIComponent(error)}`, baseUrl))
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const baseUrl = request.nextUrl.origin

  // Read and clean up OAuth cookies
  const storedState = cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value
  const returnTo = cookieStore.get(GOOGLE_OAUTH_RETURN_COOKIE)?.value || '/account'

  // Check for user cancellation / error from Google
  const googleError = request.nextUrl.searchParams.get('error')
  if (googleError) {
    log.warn('Google OAuth error', { error: googleError })
    cleanupCookies(cookieStore)
    return redirectWithError(baseUrl, 'Авторизацію через Google скасовано')
  }

  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')

  if (!code || !state) {
    cleanupCookies(cookieStore)
    return redirectWithError(baseUrl, 'Невірний запит авторизації')
  }

  // CSRF validation via timing-safe comparison
  if (!storedState || !timingSafeCompare(state, storedState)) {
    log.warn('OAuth state mismatch — possible CSRF')
    cleanupCookies(cookieStore)
    return redirectWithError(baseUrl, 'Помилка безпеки. Спробуйте ще раз.')
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code)

    // Get user profile from Google
    const userInfo = await getGoogleUserInfo(tokenData.access_token)

    if (!userInfo.email) {
      cleanupCookies(cookieStore)
      return redirectWithError(baseUrl, 'Не вдалося отримати email з Google')
    }

    // Find or create customer in Payload
    const { customer, isNew, isLinked } = await findOrCreateCustomer(userInfo)

    // Set auth cookie
    cookieStore.set(CUSTOMER_TOKEN_COOKIE, signCustomerId(String(customer.id)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    cleanupCookies(cookieStore)

    log.info('Google OAuth login successful', { customerId: customer.id, email: userInfo.email })

    // Send email for new or linked Google users
    if (isNew || isLinked) {
      const firstName = (customer as unknown as { firstName: string }).firstName
      import('@/lib/email/email-actions')
        .then(({ sendWelcomeEmail }) => sendWelcomeEmail(userInfo.email, firstName))
        .catch((err) => log.error('Welcome email failed', err))
    }

    return NextResponse.redirect(new URL(returnTo, baseUrl))
  } catch (err) {
    log.error('Google OAuth callback error', err)
    cleanupCookies(cookieStore)
    return redirectWithError(baseUrl, 'Помилка авторизації через Google. Спробуйте ще раз.')
  }
}

async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    log.error('Token exchange failed', { status: response.status, body: text })
    throw new Error('Failed to exchange code for token')
  }

  return response.json()
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info')
  }

  return response.json()
}

async function findOrCreateCustomer(userInfo: GoogleUserInfo) {
  const payload = await getPayload({ config })

  // 1. Try to find by googleId (returning Google user)
  const byGoogleId = await payload.find({
    collection: 'customers',
    where: { googleId: { equals: userInfo.id } },
    limit: 1,
  })
  if (byGoogleId.docs.length > 0) {
    return { customer: byGoogleId.docs[0], isNew: false, isLinked: false }
  }

  // 2. Try to find by email (link existing account)
  const byEmail = await payload.find({
    collection: 'customers',
    where: { email: { equals: userInfo.email } },
    limit: 1,
  })
  if (byEmail.docs.length > 0) {
    const existing = byEmail.docs[0]
    // Link Google ID to existing account and verify email
    const updated = await payload.update({
      collection: 'customers',
      id: existing.id,
      data: {
        googleId: userInfo.id,
        emailVerified: true,
      },
    })
    log.info('Linked Google account to existing customer', { customerId: existing.id })
    return { customer: updated, isNew: false, isLinked: true }
  }

  // 3. Create new customer
  const randomPassword = crypto.randomBytes(32).toString('base64')
  const newCustomer = await payload.create({
    collection: 'customers',
    data: {
      email: userInfo.email,
      password: randomPassword,
      firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'Користувач',
      lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
      googleId: userInfo.id,
      authProvider: 'google',
      emailVerified: true,
    },
  })

  log.info('Created new customer via Google OAuth', { customerId: newCustomer.id })
  return { customer: newCustomer, isNew: true, isLinked: false }
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return crypto.timingSafeEqual(bufA, bufB)
}

function cleanupCookies(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  cookieStore.delete(GOOGLE_OAUTH_STATE_COOKIE)
  cookieStore.delete(GOOGLE_OAUTH_RETURN_COOKIE)
}
