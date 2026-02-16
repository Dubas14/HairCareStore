'use client'

import { useMutation } from '@tanstack/react-query'

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/customers/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Помилка надсилання. Спробуйте пізніше.')
      return res.json()
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Помилка зміни пароля.')
      return res.json()
    },
  })
}
