"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Menu, X, Search, ShoppingBag, User } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { useUIStore } from "@/stores/ui-store"

const navigation = [
  { name: "Каталог", href: "/shop" },
  { name: "Категорії", href: "/shop?category=all" },
  { name: "Бренди", href: "/shop?filter=brands" },
  { name: "Quiz", href: "/quiz" },
  { name: "Блог", href: "/blog" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { openCart, getItemCount } = useCartStore()
  const { openSearch } = useUIStore()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const itemCount = mounted ? getItemCount() : 0

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="HAIRLAB"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
              <div className="flex items-baseline">
                <span className="text-xl font-black text-foreground tracking-wide">HAIR</span>
                <span
                  className="text-xl font-black tracking-wide"
                  style={{
                    background: 'linear-gradient(135deg, #2A9D8F, #48CAE4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >LAB</span>
              </div>
              <div className="text-[8px] font-bold text-muted-foreground tracking-[0.15em] -mt-0.5">
                PROFESSIONAL CARE
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={openSearch}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Пошук"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/account"
              className="p-2 rounded-full hover:bg-muted transition-colors hidden sm:flex"
              aria-label="Акаунт"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={openCart}
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Кошик"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Cart count badge */}
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center transition-transform"
                style={{
                  transform: itemCount > 0 ? 'scale(1)' : 'scale(0)',
                }}
                aria-live="polite"
              >
                {itemCount}
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/account"
                className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Акаунт
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
