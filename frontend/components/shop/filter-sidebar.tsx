'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Sheet } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getFilterFacets } from '@/lib/payload/actions'
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
  search?: string
}

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-black/6 pb-4 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground/72">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  )
}

function FilterContent({
  filters,
  onFiltersChange,
  maxPrice = 5000,
  hideBrandFilter,
  hideCategoryFilter,
  search,
}: FilterSidebarProps) {
  const [brandOptions, setBrandOptions] = useState<FilterOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([])
  const [dynamicMaxPrice, setDynamicMaxPrice] = useState(maxPrice)

  useEffect(() => {
    getFilterFacets({ search }).then((facets) => {
      if (!hideCategoryFilter) {
        setCategoryOptions(
          facets.categories.map((c) => ({ id: c.id, label: c.name, count: c.count }))
        )
      }
      if (!hideBrandFilter) {
        setBrandOptions(
          facets.brands.map((b) => ({ id: b.slug, label: b.name, count: b.count }))
        )
      }
      if (facets.priceRange.max > 0) {
        setDynamicMaxPrice(facets.priceRange.max)
      }
    })
  }, [hideBrandFilter, hideCategoryFilter, search])

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

  const hasPriceFilter = filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice
  const activeFiltersCount =
    filters.brands.length + (filters.categoryIds?.length || 0) + (hasPriceFilter ? 1 : 0)

  const clearAllFilters = () => {
    onFiltersChange({
      brands: [],
      priceRange: [0, maxPrice],
      categoryIds: [],
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.4rem] bg-[#f6efe7] p-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/52">
          Активні фільтри
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {activeFiltersCount}
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="rounded-full px-4 text-destructive hover:text-destructive"
            >
              <X className="mr-1 h-4 w-4" />
              Очистити
            </Button>
          )}
        </div>
      </div>

      {!hideCategoryFilter && (
        <FilterSection title="Категорія">
          {categoryOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Завантаження...</p>
          ) : (
            categoryOptions.map((cat) => (
              <Checkbox
                key={cat.id}
                label={`${cat.label}${cat.count !== undefined ? ` (${cat.count})` : ''}`}
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
                label={`${brand.label}${brand.count !== undefined ? ` (${brand.count})` : ''}`}
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
          max={dynamicMaxPrice}
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
  const activeCount =
    props.filters.brands.length +
    (props.filters.categoryIds?.length || 0) +
    (props.filters.priceRange[0] > 0 || props.filters.priceRange[1] < (props.maxPrice || 5000)
      ? 1
      : 0)

  return (
    <>
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsMobileOpen(true)}
          className="w-full rounded-full border-black/8 bg-white py-6"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Фільтри
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-[#1A1A1A] px-2 py-0.5 text-xs text-white">
              {activeCount}
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
        <div className="sticky top-28 rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.05)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f4ebe2]">
              <SlidersHorizontal className="h-4 w-4 text-[#2A9D8F]" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/48">
                Налаштування
              </p>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                Фільтри
              </h2>
            </div>
          </div>
          <FilterContent {...props} />
        </div>
      </aside>
    </>
  )
}
