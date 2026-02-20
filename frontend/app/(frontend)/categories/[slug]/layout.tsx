import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Категорія | HAIR LAB',
  description: 'Перегляньте товари в цій категорії — професійна косметика для волосся HAIR LAB.',
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
