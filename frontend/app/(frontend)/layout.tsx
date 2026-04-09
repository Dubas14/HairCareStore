import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Inter, Playfair_Display } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import '../../styles/globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import { CustomerInitializer } from '@/components/providers/customer-initializer'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart'
import { SearchDialog } from '@/components/search'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { FacebookPixel } from '@/components/analytics/facebook-pixel'

const CompareBar = dynamic(() => import('@/components/compare/compare-bar').then(m => m.CompareBar))
const CookieConsent = dynamic(() => import('@/components/cookie-consent').then(m => m.CookieConsent))
const ChatWidget = dynamic(() => import('@/components/chat/chat-widget').then(m => m.ChatWidget))

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HAIR LAB - Професійна косметика для волосся',
  description: 'Інтернет-магазин професійної косметики для волосся. Науковий підхід до догляду з клінічно перевіреними інгредієнтами.',
  keywords: 'косметика для волосся, професійна косметика, шампунь, кондиціонер, маска для волосся, кератин, арганова олія',
  openGraph: {
    title: 'HAIR LAB - Професійна косметика для волосся',
    description: 'Інтернет-магазин професійної косметики для волосся. Науковий підхід до догляду.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200',
    siteName: 'HAIR LAB',
    type: 'website',
    locale: 'uk_UA',
  },
  twitter: {
    card: 'summary',
    title: 'HAIR LAB - Професійна косметика для волосся',
    description: 'Інтернет-магазин професійної косметики для волосся.',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3200'),
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <CartProvider>
              <CustomerInitializer />
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <CartDrawer />
              <SearchDialog />
              <CompareBar />
              {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
                <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
              )}
              {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
                <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID} />
              )}
              <CookieConsent />
              <ChatWidget />
            </CartProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
