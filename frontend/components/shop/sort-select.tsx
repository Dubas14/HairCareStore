'use client'

import { Select } from '@/components/ui/select'

export type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating'

interface SortSelectProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

const sortOptions = [
  { value: 'popular', label: 'За популярністю' },
  { value: 'newest', label: 'Новинки' },
  { value: 'price-asc', label: 'Ціна: від низької' },
  { value: 'price-desc', label: 'Ціна: від високої' },
  { value: 'rating', label: 'За рейтингом' },
]

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        Сортування:
      </span>
      <Select
        options={sortOptions}
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-[180px]"
      />
    </div>
  )
}
