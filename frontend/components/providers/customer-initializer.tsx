'use client'

/**
 * Customer Initializer
 *
 * Автоматично завантажує customer при старті додатку
 * Забезпечує що wishlist, loyalty points та інші customer data
 * доступні на всіх сторінках
 */

import { useEffect } from 'react'
import { useCustomer } from '@/lib/medusa/hooks/use-customer'

export function CustomerInitializer() {
  const { customer, isLoading } = useCustomer()

  useEffect(() => {
    if (!isLoading) {
      console.log('[CustomerInitializer] Customer loaded:', customer ? 'authenticated' : 'guest')
      if (customer) {
        console.log('[CustomerInitializer] Customer ID:', customer.id)
        console.log('[CustomerInitializer] Customer email:', customer.email)
        console.log('[CustomerInitializer] Wishlist:', customer.metadata?.wishlist)
      }
    }
  }, [customer, isLoading])

  // Цей компонент нічого не рендерить
  return null
}
