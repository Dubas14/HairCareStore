"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { ShoppingBag, Check } from "lucide-react"

interface AddToCartAnimationProps {
  children?: React.ReactNode
  onAddToCart?: () => void
  productImage?: string
  productEmoji?: string
  className?: string
  disabled?: boolean
  variant?: "primary" | "dark" | "teal"
  size?: "sm" | "md" | "lg"
  cartPosition?: { x: number; y: number } | "auto"
}

const sizeStyles = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
}

const variantStyles = {
  primary: {
    button: "bg-[#1A1A1A] text-white hover:bg-[#2d2d2d]",
    success: "bg-[#606C38]",
  },
  dark: {
    button: "bg-[#1A1A1A] text-white hover:bg-[#2d2d2d]",
    success: "bg-[#606C38]",
  },
  teal: {
    button: "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4] text-white",
    success: "bg-[#606C38]",
  },
}

export function AddToCartAnimation({
  children,
  onAddToCart,
  productImage,
  productEmoji = "🧴",
  className,
  disabled = false,
  variant = "primary",
  size = "md",
  cartPosition = "auto",
}: AddToCartAnimationProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const [isAnimating, setIsAnimating] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [flyingItem, setFlyingItem] = React.useState<{
    x: number
    y: number
    targetX: number
    targetY: number
  } | null>(null)

  const styles = variantStyles[variant]

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAnimating || disabled) return

    setIsAnimating(true)

    // Get button position
    const buttonRect = buttonRef.current?.getBoundingClientRect()
    if (!buttonRect) return

    // Calculate target position (cart icon in header)
    let targetX: number
    let targetY: number

    if (cartPosition === "auto") {
      // Find cart icon in header
      const cartIcon = document.querySelector('[data-cart-icon]')
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect()
        targetX = cartRect.left + cartRect.width / 2
        targetY = cartRect.top + cartRect.height / 2
      } else {
        // Default to top-right corner
        targetX = window.innerWidth - 60
        targetY = 40
      }
    } else {
      targetX = cartPosition.x
      targetY = cartPosition.y
    }

    // Start flying animation
    setFlyingItem({
      x: buttonRect.left + buttonRect.width / 2,
      y: buttonRect.top,
      targetX,
      targetY,
    })

    // After fly animation completes
    setTimeout(() => {
      setFlyingItem(null)
      setIsSuccess(true)
      onAddToCart?.()

      // Reset after success state
      setTimeout(() => {
        setIsSuccess(false)
        setIsAnimating(false)
      }, 1500)
    }, 600)
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={disabled || isAnimating}
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "rounded-full font-medium",
          "transition-all duration-300 ease-out",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "overflow-hidden",
          sizeStyles[size],
          isSuccess ? styles.success : styles.button,
          className
        )}
      >
        {/* Success checkmark */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center gap-2",
            "transition-all duration-300",
            isSuccess
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75"
          )}
        >
          <Check className="w-4 h-4" />
          <span>Додано!</span>
        </span>

        {/* Normal content */}
        <span
          className={cn(
            "flex items-center gap-2 transition-all duration-300",
            isSuccess
              ? "opacity-0 scale-75"
              : "opacity-100 scale-100"
          )}
        >
          <ShoppingBag className={cn(
            "transition-transform duration-300",
            isAnimating && !isSuccess && "scale-0"
          )} style={{ width: size === "sm" ? 14 : size === "lg" ? 18 : 16, height: size === "sm" ? 14 : size === "lg" ? 18 : 16 }} />
          {children || "В кошик"}
        </span>
      </button>

      {/* Flying item - rendered via Portal to escape overflow:hidden containers */}
      {flyingItem && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: flyingItem.x,
            top: flyingItem.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="animate-fly-to-cart"
            style={{
              '--target-x': `${flyingItem.targetX - flyingItem.x}px`,
              '--target-y': `${flyingItem.targetY - flyingItem.y}px`,
            } as React.CSSProperties}
          >
            {productImage ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-2xl bg-white border-2 border-white">
                <img
                  src={productImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white shadow-2xl border-2 border-white flex items-center justify-center text-2xl">
                {productEmoji}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

// Interactive demo component
interface AddToCartDemoProps {
  className?: string
}

export function AddToCartDemo({ className }: AddToCartDemoProps) {
  const [cartCount, setCartCount] = React.useState(0)
  const cartIconRef = React.useRef<HTMLDivElement>(null)
  const [cartPosition, setCartPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 })

  React.useEffect(() => {
    const updatePosition = () => {
      if (cartIconRef.current) {
        const rect = cartIconRef.current.getBoundingClientRect()
        setCartPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      }
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [])

  return (
    <div className={cn("flex flex-col items-center gap-8", className)}>
      {/* Demo cart icon */}
      <div
        ref={cartIconRef}
        className={cn(
          "relative p-4 rounded-full",
          "bg-gradient-to-r from-[#2A9D8F] to-[#48CAE4]",
          "transition-transform duration-200",
          cartCount > 0 && "animate-bounce-subtle"
        )}
      >
        <ShoppingBag className="w-6 h-6 text-white" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E63946] text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in">
            {cartCount}
          </span>
        )}
      </div>

      {/* Demo products */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-black/5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F5F5F7] to-[#EAEAEA] rounded-lg flex items-center justify-center text-3xl">
            🧴
          </div>
          <AddToCartAnimation
            variant="primary"
            size="sm"
            productEmoji="🧴"
            cartPosition={cartPosition}
            onAddToCart={() => setCartCount(c => c + 1)}
          />
        </div>

        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-black/5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F5F5F7] to-[#EAEAEA] rounded-lg flex items-center justify-center text-3xl">
            🪮
          </div>
          <AddToCartAnimation
            variant="teal"
            size="sm"
            productEmoji="🪮"
            cartPosition={cartPosition}
            onAddToCart={() => setCartCount(c => c + 1)}
          />
        </div>

        <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-black/5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#F5F5F7] to-[#EAEAEA] rounded-lg flex items-center justify-center text-3xl">
            💆
          </div>
          <AddToCartAnimation
            variant="dark"
            size="sm"
            productEmoji="💆"
            cartPosition={cartPosition}
            onAddToCart={() => setCartCount(c => c + 1)}
          />
        </div>
      </div>
    </div>
  )
}

export default AddToCartAnimation
