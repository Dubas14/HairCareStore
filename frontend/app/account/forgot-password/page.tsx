import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata: Metadata = {
  title: 'Відновлення пароля | HAIR LAB',
  description: 'Відновіть доступ до свого акаунту HAIR LAB',
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Забули пароль?"
      subtitle="Введіть email, і ми надішлемо інструкції для відновлення"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
