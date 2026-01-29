import { formatPrice } from '@/lib/utils'

interface PriceProps {
  amount: number
  currencyCode?: string
  className?: string
}

export function Price({ amount, currencyCode = 'UAH', className }: PriceProps) {
  return <span className={className}>{formatPrice(amount, currencyCode)}</span>
}
