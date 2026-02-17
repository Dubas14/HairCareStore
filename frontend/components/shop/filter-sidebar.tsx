'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getBrands } from '@/lib/payload/actions'

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
  hideBrandFilter?: boolean
}

const concerns = [
  { id: 'repair', label: 'Відновлення' },
  { id: 'hydrate', label: 'Зволоження' },
  { id: 'volume', label: "Об'єм" },
  { id: 'color', label: 'Захист кольору' },
  { id: 'oil-control', label: 'Контроль жирності' },
  { id: 'anti-dandruff', label: 'Проти лупи' },
  { id: 'hair-loss', label: 'Проти випадіння' },
]

const hairTypes = [
  { id: 'straight', label: 'Пряме' },
  { id: 'wavy', label: 'Хвилясте' },
  { id: 'curly', label: 'Кучеряве' },
  { id: 'coily', label: 'Туге кучеряве' },
]

interface BrandOption {
  id: string
  label: string
}

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

function FilterContent({ filters, onFiltersChange, maxPrice = 5000, hideBrandFilter }: FilterSidebarProps) {
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([])

  useEffect(() => {
    if (hideBrandFilter) return
    getBrands().then((brands) => {
      setBrandOptions(
        brands.map((b) => ({
          id: b.slug,
          label: b.name,
        }))
      )
    })
  }, [hideBrandFilter])

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

      <FilterSection title="Проблема">
        {concerns.map((concern) => (
          <Checkbox
            key={concern.id}
            label={concern.label}
            checked={filters.concerns.includes(concern.id)}
            onChange={(e) => handleConcernChange(concern.id, e.target.checked)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Тип волосся">
        {hairTypes.map((type) => (
          <Checkbox
            key={type.id}
            label={type.label}
            checked={filters.hairTypes.includes(type.id)}
            onChange={(e) => handleHairTypeChange(type.id, e.target.checked)}
          />
        ))}
      </FilterSection>

      {!hideBrandFilter && (
        <FilterSection title="Бренд">
          {brandOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Завантаження...</p>
          ) : (
            brandOptions.map((brand) => (
              <Checkbox
                key={brand.id}
                label={brand.label}
                checked={filters.brands.includes(brand.id)}
                onChange={(e) => handleBrandChange(brand.id, e.target.checked)}
              />
            ))
          )}
        </FilterSection>
      )}

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

      <aside className={cn("hidden lg:block", props.className)}>
        <div className="sticky top-24">
          <h2 className="text-lg font-semibold mb-4">Фільтри</h2>
          <FilterContent {...props} />
        </div>
      </aside>
    </>
  )
}
