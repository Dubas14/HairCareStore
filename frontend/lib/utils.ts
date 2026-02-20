import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { formatPrice, formatPriceRange, calculateDiscountPercentage, formatDiscount } from "./utils/format-price"
