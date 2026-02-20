import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Каталог товарів | HAIR LAB',
  description: 'Професійна косметика для волосся — шампуні, кондиціонери, маски, олії та інші засоби для догляду. Безкоштовна доставка від 1000 ₴.',
  openGraph: {
    title: 'Каталог товарів | HAIR LAB',
    description: 'Професійна косметика для волосся в інтернет-магазині HAIR LAB.',
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children
}
