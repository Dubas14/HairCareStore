'use client'

import { useMutation } from '@tanstack/react-query'
import { sdk } from '../client'

/**
 * Hook for requesting password reset
 * Sends reset token to user's email
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string): Promise<void> => {
      await sdk.auth.resetPassword('customer', 'emailpass', {
        identifier: email,
      })
    },
  })
}

/**
 * Hook for completing password reset with token
 * Used on /account/reset-password page
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({
      token,
      email,
      password,
    }: {
      token: string
      email: string
      password: string
    }): Promise<void> => {
      await sdk.auth.updateProvider(
        'customer',
        'emailpass',
        {
          email,
          password,
        },
        token
      )
    },
  })
}
