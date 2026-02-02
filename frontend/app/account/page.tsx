import { Metadata } from 'next'
import { AccountDashboard } from '@/components/auth/account-dashboard'

export const metadata: Metadata = {
  title: 'Особистий кабінет | HAIR LAB',
  description: 'Керуйте своїм акаунтом, переглядайте замовлення та налаштуйте персональні рекомендації',
}

export default function AccountPage() {
  return <AccountDashboard />
}
