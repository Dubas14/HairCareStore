import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  GOOGLE_AUTH_URL,
  GOOGLE_OAUTH_STATE_COOKIE,
  GOOGLE_OAUTH_RETURN_COOKIE,
  GOOGLE_SCOPES,
  isGoogleOAuthConfigured,
  getGoogleClientId,
  getGoogleRedirectUri,
} from '@/lib/auth/google-oauth'

export async function GET(request: NextRequest) {
  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      new URL('/account/login?error=Google авторизація не налаштована', request.url)
    )
  }

  // Generate CSRF state
  const state = crypto.randomBytes(32).toString('hex')

  // Validate returnTo — only allow relative paths
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/account'
  const safeReturnTo = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/account'

  // Build Google OAuth URL
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    state,
    access_type: 'online',
    prompt: 'select_account',
  })

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`)

  // Store state in httpOnly cookie (10 min TTL)
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  // Store returnTo path
  response.cookies.set(GOOGLE_OAUTH_RETURN_COOKIE, safeReturnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
