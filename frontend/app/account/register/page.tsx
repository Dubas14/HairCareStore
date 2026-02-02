import { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: 'Реєстрація | HAIR LAB',
  description: 'Створіть акаунт HAIR LAB для персональних рекомендацій та ексклюзивних знижок',
}

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Створіть акаунт"
      subtitle="Приєднуйтесь до HAIR LAB для персональних рекомендацій та ексклюзивних пропозицій"
    >
      <RegisterForm />
    </AuthLayout>
  )
}
