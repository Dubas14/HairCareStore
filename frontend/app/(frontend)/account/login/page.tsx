import { Suspense } from 'react'
import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Вхід | HAIR LAB',
  description: 'Увійдіть до свого акаунту HAIR LAB для доступу до замовлень та персональних рекомендацій',
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Вітаємо знову"
      subtitle="Увійдіть до свого акаунту для доступу до замовлень та персональних рекомендацій"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
