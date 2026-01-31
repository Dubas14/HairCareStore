import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { QueryProvider } from '@/components/providers/query-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart'
import { SearchDialog } from '@/components/search'
import '../styles/globals.css'

// Main font for body text
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

// Accent font for quotes, ingredients, testimonials
const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-playfair',
  display: 'swap',
})

// Monospace font for scientific data, formulas, percentages
const jetbrains = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HAIR LAB - Професійна косметика для волосся',
  description: 'Інтернет-магазин професійної косметики для волосся. Науковий підхід до догляду з клінічно перевіреними інгредієнтами.',
  keywords: 'косметика для волосся, професійна косметика, шампунь, кондиціонер, маска для волосся, кератин, арганова олія',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body>
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CartDrawer />
          <SearchDialog />
        </QueryProvider>
      </body>
    </html>
  )
}
