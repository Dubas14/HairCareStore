"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Menu, X, Search, ShoppingBag, User } from "lucide-react"
import { useCartContext } from "@/components/providers/cart-provider"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

function MagneticIconButton({
  children,
  onClick,
  href,
  className,
  ariaLabel,
  badge,
  dataCartIcon,
  testId,
  inverse,
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  ariaLabel: string
  badge?: number
  dataCartIcon?: boolean
  testId?: string
  inverse?: boolean
}) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const lastMoveRef = useRef(0)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastMoveRef.current < 16) return
    lastMoveRef.current = now
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    setPosition({
      x: (e.clientX - centerX) * 0.22,
      y: (e.clientY - centerY) * 0.22,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setPosition({ x: 0, y: 0 })
  }, [])

  const style = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isHovered
      ? "transform 0.14s cubic-bezier(0.33, 1, 0.68, 1)"
      : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
  }

  const innerStyle = {
    transform: `translate(${position.x * 0.18}px, ${position.y * 0.18}px)`,
    transition: isHovered
      ? "transform 0.14s cubic-bezier(0.33, 1, 0.68, 1)"
      : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
  }

  const sharedProps = {
    className: cn(
      "relative flex h-11 w-11 items-center justify-center rounded-full border border-black/8",
      inverse
        ? "border-white/18 bg-white/[0.03] text-white shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-xl hover:border-white/24 hover:bg-white/[0.08]"
        : "bg-white text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-black/12 hover:bg-white hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]",
      "transition-[border-color,background-color,box-shadow] duration-300",
      "group",
      className
    ),
    onMouseMove: handleMouseMove,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: handleMouseLeave,
    "aria-label": ariaLabel,
    style,
    ...(dataCartIcon && { "data-cart-icon": true }),
    ...(testId && { "data-testid": testId }),
  }

  const content = (
    <>
      <span style={innerStyle} className="block">
        {children}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-live="polite"
          aria-label={`Кошик: ${badge} товарів`}
          className={cn(
            "absolute -right-1 -top-1 min-w-[20px] rounded-full px-1.5 py-0.5",
            "flex items-center justify-center text-[10px] font-semibold text-white",
            "bg-[#1A1A1A] shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
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

function NavLink({
  href,
  children,
  inverse,
}: {
  href: string
  children: React.ReactNode
  inverse?: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        "relative px-1 py-2 text-[13px] font-semibold tracking-[0.12em] uppercase",
        "transition-colors duration-300",
        inverse
          ? isActive
            ? "text-white"
            : "text-white/82 hover:text-white"
          : isActive
            ? "text-foreground"
            : "text-foreground/62 hover:text-foreground"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-1 -bottom-0.5 h-px origin-left rounded-full",
          inverse
            ? "bg-gradient-to-r from-[#f4d5b0] via-white to-[#88ded4]"
            : "bg-gradient-to-r from-[#D4A373] via-[#2A9D8F] to-[#48CAE4]",
          "transition-transform duration-300 ease-out",
          isActive ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  )
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const { openCart, getItemCount } = useCartContext()
  const { openSearch } = useUIStore()
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")
  const isHome = pathname === "/"
  const compactMode = scrollY > 20

  const navigation = [
    { name: t("shop"), href: "/shop" },
    { name: t("brands"), href: "/brands" },
    { name: t("blog"), href: "/blog" },
    { name: t("about"), href: "/pages/about" },
    { name: t("delivery"), href: "/pages/delivery" },
    { name: t("contacts"), href: "/pages/contacts" },
  ]

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const itemCount = mounted ? getItemCount() : 0

  return (
    <header
      data-testid="site-header"
      className={cn(
        "z-50 px-4 py-3 md:px-5",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      )}
    >
      <div
        className={cn(
          "relative mx-auto max-w-[1260px] overflow-hidden rounded-full border transition-all duration-500",
          "border-black/8 bg-background shadow-[0_14px_36px_rgba(0,0,0,0.08)]"
        )}
      >
        <nav className="px-5 md:px-6">
          <div
            className={cn(
              "flex items-center justify-between gap-5 transition-[min-height] duration-300",
              compactMode ? "min-h-[62px]" : "min-h-[66px]"
            )}
          >
            <Link href="/" className="relative z-10 flex items-center gap-0.5">
              <Image
                src="/logo.png"
                alt="HAIRLAB"
                width={36}
                height={36}
                priority
                className="h-9 w-9 object-contain"
              />

              <div className="leading-none">
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-[0.98rem] font-black tracking-[0.16em]",
                    "text-foreground"
                  )}
                >
                  <span>HAIR</span>
                  <span
                    className={cn(
                      "bg-clip-text text-transparent",
                      "bg-gradient-to-r from-[#1A1A1A] via-[#2A9D8F] to-[#D4A373]"
                    )}
                  >
                    LAB
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-1 text-[8px] font-medium uppercase tracking-[0.26em]",
                    "text-foreground/42"
                  )}
                >
                  professional care
                </p>
              </div>
            </Link>

            <div className="hidden flex-1 justify-center md:flex">
              <div className="flex items-center gap-7">
                {navigation.map((item) => (
                  <NavLink key={item.name} href={item.href}>
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MagneticIconButton
                onClick={openSearch}
                ariaLabel={tCommon("search")}
                testId="search-button"
              >
                <Search className="h-4.5 w-4.5 text-foreground/72 transition-colors group-hover:text-foreground" />
              </MagneticIconButton>

              <MagneticIconButton
                href="/account"
                ariaLabel={t("account")}
                className="hidden sm:flex"
              >
                <User className="h-4.5 w-4.5 text-foreground/72 transition-colors group-hover:text-foreground" />
              </MagneticIconButton>

              <MagneticIconButton
                onClick={openCart}
                ariaLabel={t("cart")}
                badge={itemCount}
                dataCartIcon
                testId="cart-button"
              >
                <ShoppingBag className="h-4.5 w-4.5 text-foreground/72 transition-colors group-hover:text-foreground" />
              </MagneticIconButton>

              <button
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border border-black/8",
                  "bg-white text-foreground shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-black/12 hover:bg-white",
                  "transition-all duration-300 md:hidden",
                  mobileMenuOpen && "bg-[#f3ece5]"
                )}
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
                aria-expanded={mobileMenuOpen}
              >
                <div className="relative h-5 w-5">
                  <Menu
                    className={cn(
                      "absolute inset-0 h-5 w-5 transition-all duration-300",
                      mobileMenuOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                    )}
                  />
                  <X
                    className={cn(
                      "absolute inset-0 h-5 w-5 transition-all duration-300",
                      mobileMenuOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>

          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity,padding] duration-500 ease-out md:hidden",
              mobileMenuOpen ? "grid-rows-[1fr] pb-4 opacity-100" : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <div className="rounded-[1.5rem] border border-black/8 bg-[#fbf8f4]/95 p-3 shadow-[0_16px_44px_rgba(0,0,0,0.08)]">
                <div className="grid gap-1.5">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="rounded-[1.1rem] px-4 py-3 text-sm font-medium text-foreground/76 transition-all duration-300 hover:bg-white hover:text-foreground"
                    >
                      {item.name}
                    </Link>
                  ))}

                  <Link
                    href="/account"
                    className="rounded-[1.1rem] px-4 py-3 text-sm font-medium text-foreground/76 transition-all duration-300 hover:bg-white hover:text-foreground sm:hidden"
                  >
                    {t("account")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
