'use client'

import { GitCompareArrows } from 'lucide-react'
import { useCompareStore } from '@/stores/compare-store'
import type { Product } from '@/lib/constants/home-data'

interface CompareButtonProps {
  product: Product
  className?: string
}

export function CompareButton({ product, className = '' }: CompareButtonProps) {
  const { addItem, removeItem, isInCompare, items } = useCompareStore()
  const active = isInCompare(product.id)
  const isFull = items.length >= 4

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (active) {
      removeItem(product.id)
    } else if (!isFull) {
      addItem(product)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!active && isFull}
      className={`p-2 rounded-full transition-all duration-200 ${
        active
          ? 'bg-primary text-primary-foreground shadow-md'
          : isFull
            ? 'bg-white/60 text-muted-foreground cursor-not-allowed'
            : 'bg-white/90 hover:bg-white text-secondary shadow-soft'
      } ${className}`}
      aria-label={active ? 'Видалити з порівняння' : 'Додати до порівняння'}
      title={active ? 'Видалити з порівняння' : isFull ? 'Максимум 4 товари' : 'Порівняти'}
    >
      <GitCompareArrows className="w-4 h-4" />
    </button>
  )
}
