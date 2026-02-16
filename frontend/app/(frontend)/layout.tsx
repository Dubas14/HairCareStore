import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import '../../styles/globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import { CustomerInitializer } from '@/components/providers/customer-initializer'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart'
import { SearchDialog } from '@/components/search'

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

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`}>
      <body>
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
          </CartProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
