/**
 * Google OAuth 2.0 constants and helpers
 */

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

export const GOOGLE_OAUTH_STATE_COOKIE = 'google-oauth-state'
export const GOOGLE_OAUTH_RETURN_COOKIE = 'google-oauth-return'

export const GOOGLE_SCOPES = ['openid', 'email', 'profile'].join(' ')

export function isGoogleOAuthConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export function getGoogleClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID
  if (!id) throw new Error('GOOGLE_CLIENT_ID is not configured')
  return id
}

export function getGoogleClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET
  if (!secret) throw new Error('GOOGLE_CLIENT_SECRET is not configured')
  return secret
}

export function getGoogleRedirectUri(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'
  return `${base}/api/auth/google/callback`
}
