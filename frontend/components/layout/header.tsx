"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Search, ShoppingBag, User, FlaskConical } from "lucide-react"

const navigation = [
  { name: "Каталог", href: "/products" },
  { name: "Категорії", href: "/categories" },
  { name: "Бренди", href: "/brands" },
  { name: "Quiz", href: "/quiz" },
  { name: "Блог", href: "/blog" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-[#48CAE4] flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              HAIR<span className="text-primary">LAB</span>
            </span>
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
            <Link
              href="/cart"
              className="relative p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Кошик"
            >
              <ShoppingBag className="w-5 h-5" />
              {/* Cart count badge */}
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center"
                aria-live="polite"
              >
                0
              </span>
            </Link>

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
