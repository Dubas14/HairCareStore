'use client'

import { useEffect } from 'react'
import { useCustomer } from '@/lib/hooks/use-customer'

export function CustomerInitializer() {
  const { customer, isLoading } = useCustomer()

  useEffect(() => {
    if (!isLoading) {
      console.log('[CustomerInitializer] Customer:', customer ? 'authenticated' : 'guest')
    }
  }, [customer, isLoading])

  return null
}
