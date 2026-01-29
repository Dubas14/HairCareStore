import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Beauty Hair Store - Професійна косметика для волосся',
  description: 'Інтернет-магазин професійної косметики для волосся. Шампуні, кондиціонери, маски та засоби для укладання від провідних брендів.',
  keywords: 'косметика для волосся, професійна косметика, шампунь, кондиціонер, маска для волосся',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk" className={inter.variable}>
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-primary">Beauty Hair Store</h1>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t mt-auto">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
              © 2026 Beauty Hair Store. Всі права захищені.
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
