import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price for display
 * Note: Prices are stored in major units (e.g., hryvnias, dollars)
 * No division by 100 needed
 */
export function formatPrice(amount: number, currencyCode: string = "UAH"): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: currencyCode,
  }).format(amount)
}
