// Розширення типів Medusa для кастомних полів

import { Product as MedusaProduct } from '@medusajs/js-sdk'

declare module '@medusajs/js-sdk' {
  interface Product extends MedusaProduct {
    hair_type?: string
    hair_problems?: string[]
    ingredients?: string[]
    allergens?: string[]
    is_vegan?: boolean
    is_cruelty_free?: boolean
    brand?: string
  }
}
