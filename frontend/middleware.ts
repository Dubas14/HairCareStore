import { NextRequest, NextResponse } from 'next/server'

const LOCALE = 'uk'
const COOKIE_NAME = 'NEXT_LOCALE'

/**
 * Middleware that forces Ukrainian locale for the entire storefront.
 * Always sets NEXT_LOCALE=uk cookie regardless of browser language.
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

  // Always force Ukrainian locale
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value
  if (cookieLocale === LOCALE) {
    return NextResponse.next()
  }

  // Set/override locale cookie to Ukrainian
  const response = NextResponse.next()
  response.cookies.set(COOKIE_NAME, LOCALE, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  })

  return response
}

export const config = {
  matcher: '/((?!api|admin|_next|_vercel|media|.*\\..*).*)',
}
