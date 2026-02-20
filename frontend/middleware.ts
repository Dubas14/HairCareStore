import { NextRequest, NextResponse } from 'next/server'

const SUPPORTED_LOCALES = ['uk', 'en', 'pl', 'de', 'ru']
const DEFAULT_LOCALE = 'uk'
const COOKIE_NAME = 'NEXT_LOCALE'

/**
 * Lightweight locale detection middleware (without i18n URL routing).
 * Detects locale from cookie or Accept-Language header, sets NEXT_LOCALE cookie.
 * Does NOT rewrite URLs — our routes stay at /(frontend)/ without [locale] segment.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip admin, API, static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/media') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check existing cookie
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return NextResponse.next()
  }

  // Detect from Accept-Language header
  const acceptLang = request.headers.get('accept-language') || ''
  let detectedLocale = DEFAULT_LOCALE

  for (const part of acceptLang.split(',')) {
    const lang = part.split(';')[0].trim().substring(0, 2).toLowerCase()
    if (SUPPORTED_LOCALES.includes(lang)) {
      detectedLocale = lang
      break
    }
  }

  // Set locale cookie
  const response = NextResponse.next()
  response.cookies.set(COOKIE_NAME, detectedLocale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: '/((?!api|admin|_next|_vercel|media|.*\\..*).*)',
}
