'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getBrands, getCategories } from '@/lib/payload/actions'
import { formatPrice } from '@/lib/utils/format-price'

export interface FilterState {
  brands: string[]
  priceRange: [number, number]
  categoryIds?: string[]
}

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  maxPrice?: number
  className?: string
  hideBrandFilter?: boolean
  hideCategoryFilter?: boolean
}

interface FilterOption {
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
        aria-expanded={isOpen}
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

function FilterContent({ filters, onFiltersChange, maxPrice = 5000, hideBrandFilter, hideCategoryFilter }: FilterSidebarProps) {
  const [brandOptions, setBrandOptions] = useState<FilterOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([])

  useEffect(() => {
    if (!hideBrandFilter) {
      getBrands().then((brands) => {
        setBrandOptions(brands.map((b) => ({ id: b.slug, label: b.name })))
      })
    }
    if (!hideCategoryFilter) {
      getCategories().then((categories) => {
        setCategoryOptions(categories.map((c) => ({ id: String(c.id), label: c.name })))
      })
    }
  }, [hideBrandFilter, hideCategoryFilter])

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked
      ? [...filters.brands, brandId]
      : filters.brands.filter((b) => b !== brandId)
    onFiltersChange({ ...filters, brands: newBrands })
  }

  const handleCategoryChange = (catId: string, checked: boolean) => {
    const current = filters.categoryIds || []
    const newCats = checked
      ? [...current, catId]
      : current.filter((c) => c !== catId)
    onFiltersChange({ ...filters, categoryIds: newCats })
  }

  const handlePriceChange = (value: [number, number]) => {
    onFiltersChange({ ...filters, priceRange: value })
  }

  const activeFiltersCount =
    filters.brands.length +
    (filters.categoryIds?.length || 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0)

  const clearAllFilters = () => {
    onFiltersChange({
      brands: [],
      priceRange: [0, maxPrice],
      categoryIds: [],
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

      {!hideCategoryFilter && (
        <FilterSection title="Категорія">
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Завантаження...</p>
          ) : (
            categoryOptions.map((cat) => (
              <Checkbox
                key={cat.id}
                label={cat.label}
                checked={(filters.categoryIds || []).includes(cat.id)}
                onChange={(e) => handleCategoryChange(cat.id, e.target.checked)}
              />
            ))
          )}
        </FilterSection>
      )}

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
          formatValue={(v) => formatPrice(v)}
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
          {(props.filters.brands.length > 0 ||
            (props.filters.categoryIds?.length || 0) > 0) && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
              {props.filters.brands.length + (props.filters.categoryIds?.length || 0)}
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
