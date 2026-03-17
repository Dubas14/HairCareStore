'use client'

import { ArrowDownWideNarrow } from 'lucide-react'
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
    <div className="flex items-center gap-3 rounded-full border border-black/8 bg-white px-4 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
      <div className="hidden items-center gap-2 sm:flex">
        <ArrowDownWideNarrow className="h-4 w-4 text-[#2A9D8F]" />
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/52">
          Сортування
        </span>
      </div>

      <Select
        options={sortOptions}
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="w-[180px] border-0 bg-transparent px-0 py-0 text-sm shadow-none focus:ring-0"
      />
    </div>
  )
}
