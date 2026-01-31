'use client'

import { useState } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export interface FilterState {
  concerns: string[]
  hairTypes: string[]
  brands: string[]
  priceRange: [number, number]
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  maxPrice?: number
  className?: string
}

const concerns = [
  { id: 'repair', label: 'Відновлення', count: 45 },
  { id: 'hydrate', label: 'Зволоження', count: 38 },
  { id: 'volume', label: "Об'єм", count: 29 },
  { id: 'color', label: 'Захист кольору', count: 52 },
  { id: 'oil-control', label: 'Контроль жирності', count: 21 },
  { id: 'anti-dandruff', label: 'Проти лупи', count: 18 },
  { id: 'hair-loss', label: 'Проти випадіння', count: 24 },
]

const hairTypes = [
  { id: 'straight', label: 'Пряме', count: 120 },
  { id: 'wavy', label: 'Хвилясте', count: 85 },
  { id: 'curly', label: 'Кучеряве', count: 67 },
  { id: 'coily', label: 'Туге кучеряве', count: 34 },
]

const brands = [
  { id: 'elgon', label: 'Elgon', count: 45 },
  { id: 'inebrya', label: 'INEBRYA', count: 78 },
  { id: 'mood', label: 'MOOD', count: 34 },
  { id: 'nevitaly', label: 'NEVITALY', count: 56 },
  { id: 'link-d', label: 'LINK D', count: 23 },
  { id: 'trend-toujours', label: 'Trend Toujours', count: 41 },
]

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-semibold text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

function FilterContent({ filters, onFiltersChange, maxPrice = 5000 }: FilterSidebarProps) {
  const handleConcernChange = (concernId: string, checked: boolean) => {
    const newConcerns = checked
      ? [...filters.concerns, concernId]
      : filters.concerns.filter((c) => c !== concernId)
    onFiltersChange({ ...filters, concerns: newConcerns })
  }

  const handleHairTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.hairTypes, typeId]
      : filters.hairTypes.filter((t) => t !== typeId)
    onFiltersChange({ ...filters, hairTypes: newTypes })
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brandId]
      : filters.brands.filter((b) => b !== brandId)
    onFiltersChange({ ...filters, brands: newBrands })
  }

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: value })
  }

  const activeFiltersCount =
    filters.concerns.length +
    filters.hairTypes.length +
    filters.brands.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0)

  const clearAllFilters = () => {
    onFiltersChange({
      concerns: [],
      hairTypes: [],
      brands: [],
      priceRange: [0, maxPrice],
    })
  }

  return (
    <div className="space-y-4">
      {/* Header with clear button */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            Активні фільтри: {activeFiltersCount}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Очистити
          </Button>
        </div>
      )}

      {/* Concerns */}
      <FilterSection title="Проблема">
        {concerns.map((concern) => (
          <Checkbox
            key={concern.id}
            label={concern.label}
            count={concern.count}
            checked={filters.concerns.includes(concern.id)}
            onChange={(e) => handleConcernChange(concern.id, e.target.checked)}
          />
        ))}
      </FilterSection>

      {/* Hair Type */}
      <FilterSection title="Тип волосся">
        {hairTypes.map((type) => (
          <Checkbox
            key={type.id}
            label={type.label}
            count={type.count}
            checked={filters.hairTypes.includes(type.id)}
            onChange={(e) => handleHairTypeChange(type.id, e.target.checked)}
          />
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Бренд">
        {brands.map((brand) => (
          <Checkbox
            key={brand.id}
            label={brand.label}
            count={brand.count}
            checked={filters.brands.includes(brand.id)}
            onChange={(e) => handleBrandChange(brand.id, e.target.checked)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Ціна">
        <Slider
          min={0}
          max={maxPrice}
          value={filters.priceRange}
          onChange={handlePriceChange}
          step={50}
          formatValue={(v) => `${v} ₴`}
        />
      </FilterSection>
    </div>
  )
}

export function FilterSidebar(props: FilterSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileOpen(true)}
          className="w-full"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Фільтри
          {(props.filters.concerns.length > 0 ||
            props.filters.hairTypes.length > 0 ||
            props.filters.brands.length > 0) && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {props.filters.concerns.length +
                props.filters.hairTypes.length +
                props.filters.brands.length}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Sheet */}
      <Sheet
        open={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        side="left"
        title="Фільтри"
      >
        <div className="p-6">
          <FilterContent {...props} />
        </div>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:block", props.className)}>
        <div className="sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Фільтри</h2>
          <FilterContent {...props} />
        </div>
      </aside>
    </>
  )
}
