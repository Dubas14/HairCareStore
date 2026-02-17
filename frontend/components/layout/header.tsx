"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { Menu, X, Search, ShoppingBag, User } from "lucide-react"
import { useCartContext } from "@/components/providers/cart-provider"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Каталог", href: "/shop" },
  { name: "Бренди", href: "/shop?filter=brands" },
  { name: "Блог", href: "/blog" },
  { name: "Про нас", href: "/pages/about" },
  { name: "Доставка", href: "/pages/delivery" },
  { name: "Контакти", href: "/pages/contacts" },
]

// Magnetic Icon Button Component
function MagneticIconButton({
  children,
  onClick,
  href,
  className,
  ariaLabel,
  badge,
  dataCartIcon,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  ariaLabel: string
  badge?: number
  dataCartIcon?: boolean
}) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setPosition({
      x: (e.clientX - centerX) * 0.3,
      y: (e.clientY - centerY) * 0.3,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setPosition({ x: 0, y: 0 })
  }, [])

  const style = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isHovered
      ? "transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)"
      : "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
  }

  const innerStyle = {
    transform: `translate(${position.x * 0.2}px, ${position.y * 0.2}px)`,
    transition: isHovered
      ? "transform 0.15s cubic-bezier(0.33, 1, 0.68, 1)"
      : "transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)",
  }

  const sharedProps = {
    className: cn(
      "relative p-2.5 rounded-full transition-colors duration-300",
      "hover:bg-gradient-to-br hover:from-[#2A9D8F]/10 hover:to-[#48CAE4]/10",
      "group",
      className
    ),
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    "aria-label": ariaLabel,
    style,
    ...(dataCartIcon && { "data-cart-icon": true }),
  }

  const content = (
    <>
      <span style={innerStyle} className="block">
        {children}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1",
            "rounded-full text-xs font-semibold",
            "flex items-center justify-center",
            "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] text-white",
            "shadow-[0_2px_8px_rgba(42,157,143,0.4)]",
            "transition-transform duration-300",
            "animate-pulse-subtle"
          )}
        >
          {badge}
        </span>
      )}
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        {...sharedProps}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      {...sharedProps}
    >
      {content}
    </button>
  )
}

// Animated Nav Link Component
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative text-sm font-medium text-muted-foreground",
        "transition-colors duration-300 hover:text-foreground",
        "group py-1"
      )}
    >
      {children}
      {/* Gradient underline */}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-[2px] w-0",
          "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4]",
          "transition-all duration-300 ease-out",
          "group-hover:w-full"
        )}
      />
    </Link>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openCart, getItemCount } = useCartContext()
  const { openSearch } = useUIStore()

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const itemCount = mounted ? getItemCount() : 0

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-sm"
          : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      {/* Gradient border bottom */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[1px]",
          "bg-gradient-to-r from-transparent via-border to-transparent",
          "transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-50"
        )}
      />

      {/* Accent gradient line */}
      <div
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0",
          "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4]",
          "transition-all duration-700 ease-out",
          scrolled && "w-32"
        )}
      />

      <nav className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="HAIRLAB"
                width={40}
                height={40}
                priority
                className={cn(
                  "object-contain transition-transform duration-500",
                  "group-hover:scale-110"
                )}
                style={{ width: "auto", height: "auto" }}
              />
              {/* Logo glow on hover */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full opacity-0",
                  "bg-gradient-to-br from-[#2A9D8F]/20 to-[#48CAE4]/20 blur-xl",
                  "transition-opacity duration-500",
                  "group-hover:opacity-100"
                )}
              />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="text-xl font-black text-foreground tracking-wide transition-colors duration-300">
                  HAIR
                </span>
                <span
                  className="text-xl font-black tracking-wide relative"
                  style={{
                    background: "linear-gradient(135deg, #2A9D8F, #48CAE4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  LAB
                  {/* Shimmer effect on hover */}
                  <span
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent",
                      "translate-x-[-100%] skew-x-[-20deg]",
                      "group-hover:animate-shine-sweep"
                    )}
                    style={{ WebkitBackgroundClip: "text" }}
                  />
                </span>
              </div>
              <div className="text-[8px] font-bold text-muted-foreground tracking-[0.15em] -mt-0.5">
                PROFESSIONAL CARE
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <NavLink key={item.name} href={item.href}>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-1">
            <MagneticIconButton onClick={openSearch} ariaLabel="Пошук">
              <Search className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
            </MagneticIconButton>

            <MagneticIconButton
              href="/account"
              ariaLabel="Акаунт"
              className="hidden sm:flex"
            >
              <User className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
            </MagneticIconButton>

            <MagneticIconButton
              onClick={openCart}
              ariaLabel="Кошик"
              badge={itemCount}
              dataCartIcon
            >
              <ShoppingBag className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
            </MagneticIconButton>

            {/* Mobile menu button */}
            <button
              className={cn(
                "md:hidden p-2.5 rounded-full transition-all duration-300",
                "hover:bg-gradient-to-br hover:from-[#2A9D8F]/10 hover:to-[#48CAE4]/10",
                mobileMenuOpen && "bg-muted"
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Меню"
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={cn(
                    "absolute inset-0 w-5 h-5 transition-all duration-300",
                    mobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                  )}
                />
                <X
                  className={cn(
                    "absolute inset-0 w-5 h-5 transition-all duration-300",
                    mobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-out",
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="py-4 border-t border-border/50">
            <div className="flex flex-col gap-1">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium",
                    "transition-all duration-300",
                    "hover:bg-gradient-to-r hover:from-[#2A9D8F]/5 hover:to-[#48CAE4]/5",
                    "hover:translate-x-1"
                  )}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                href="/account"
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-medium sm:hidden",
                  "transition-all duration-300",
                  "hover:bg-gradient-to-r hover:from-[#2A9D8F]/5 hover:to-[#48CAE4]/5",
                  "hover:translate-x-1"
                )}
                style={{
                  transitionDelay: mobileMenuOpen ? `${navigation.length * 50}ms` : "0ms",
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Акаунт
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
