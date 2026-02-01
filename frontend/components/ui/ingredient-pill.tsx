"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Info } from "lucide-react"

interface IngredientPillProps {
  name: string
  description?: string
  icon?: React.ReactNode
  variant?: "default" | "highlight" | "organic"
  className?: string
}

const variantStyles = {
  default: {
    pill: "bg-[#F5F5F7] hover:bg-[#EAEAEA] border-transparent",
    text: "text-[#1A1A1A]",
    popup: "bg-white",
  },
  highlight: {
    pill: "bg-gradient-to-r from-[#2A9D8F]/10 to-[#48CAE4]/10 hover:from-[#2A9D8F]/20 hover:to-[#48CAE4]/20 border-[#2A9D8F]/20",
    text: "text-[#2A9D8F]",
    popup: "bg-gradient-to-br from-[#2A9D8F] to-[#48CAE4] text-white",
  },
  organic: {
    pill: "bg-[#606C38]/10 hover:bg-[#606C38]/20 border-[#606C38]/20",
    text: "text-[#606C38]",
    popup: "bg-[#606C38] text-white",
  },
}

export function IngredientPill({
  name,
  description,
  icon,
  variant = "default",
  className,
}: IngredientPillProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const styles = variantStyles[variant]

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pill */}
      <button
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2",
          "rounded-full border text-sm font-medium",
          "transition-all duration-300 ease-out",
          "cursor-default",
          styles.pill,
          styles.text
        )}
      >
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{name}</span>
        {description && (
          <Info className={cn(
            "w-3.5 h-3.5 transition-transform duration-300",
            isHovered && "rotate-12 scale-110"
          )} />
        )}
      </button>

      {/* Popup Description */}
      {description && (
        <div
          className={cn(
            "absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2",
            "w-64 p-4 rounded-xl",
            "shadow-xl",
            "transition-all duration-300 ease-out",
            "pointer-events-none",
            styles.popup,
            isHovered
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-95"
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 -bottom-2",
              "w-4 h-4 rotate-45",
              variant === "highlight"
                ? "bg-[#48CAE4]"
                : variant === "organic"
                ? "bg-[#606C38]"
                : "bg-white"
            )}
          />

          {/* Content */}
          <div className="relative">
            <p className={cn(
              "font-semibold mb-1",
              variant === "default" && "text-[#1A1A1A]"
            )}>
              {name}
            </p>
            <p className={cn(
              "text-sm leading-relaxed",
              variant === "default" ? "text-[#717171]" : "opacity-90"
            )}>
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Grouped Ingredients Component
interface IngredientsGroupProps {
  title?: string
  ingredients: Array<{
    name: string
    description?: string
    icon?: React.ReactNode
    variant?: "default" | "highlight" | "organic"
  }>
  className?: string
}

export function IngredientsGroup({
  title,
  ingredients,
  className,
}: IngredientsGroupProps) {
  return (
    <div className={className}>
      {title && (
        <h4 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider mb-4">
          {title}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient, index) => (
          <IngredientPill
            key={index}
            name={ingredient.name}
            description={ingredient.description}
            icon={ingredient.icon}
            variant={ingredient.variant}
          />
        ))}
      </div>
    </div>
  )
}

export default IngredientPill
