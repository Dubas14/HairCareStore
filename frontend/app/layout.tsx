import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HAIR LAB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
