import { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthLayout } from '@/components/auth/auth-layout'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Новий пароль | HAIR LAB',
  description: 'Встановіть новий пароль для вашого акаунту HAIR LAB',
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Новий пароль"
      subtitle="Введіть новий пароль для вашого акаунту"
    >
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Завантаження...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
