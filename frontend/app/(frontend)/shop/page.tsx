'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { FilterSidebar, type FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, type SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { useProducts } from '@/lib/hooks/use-products'
import { transformProducts } from '@/lib/payload/types'

const PRODUCTS_PER_PAGE = 24

/** Convert URL search params → internal FilterState */
function parseFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    brands: params.get('brands')?.split(',').filter(Boolean) || [],
    priceRange: [
      Number(params.get('priceMin')) || 0,
      Number(params.get('priceMax')) || 5000,
    ],
    categoryIds: params.get('categories')?.split(',').filter(Boolean) || [],
  }
}

/** Map UI sort keys to Payload API sort keys */
function toApiSort(sort: SortOption): 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest' {
  switch (sort) {
    case 'price-asc': return 'price_asc'
    case 'price-desc': return 'price_desc'
    default: return sort
  }
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // ── State from URL ─────────────────────────────────────────────
  const searchQuery = searchParams.get('search') || ''
  const urlPage = Number(searchParams.get('page')) || 1
  const urlSort = (searchParams.get('sort') as SortOption) || 'popular'

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams))
  const [sortBy, setSortBy] = useState<SortOption>(urlSort)
  const [currentPage, setCurrentPage] = useState(urlPage)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  // ── Debounce search input ──────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(localSearch), 400)
    return () => clearTimeout(timer)
  }, [localSearch])

  // ── Sync URL ↔ State ──────────────────────────────────────────
  const updateUrl = useCallback(
    (newFilters: FilterState, newSort: SortOption, newPage: number, newSearch: string) => {
      const params = new URLSearchParams()
      if (newSearch) params.set('search', newSearch)
      if (newSort !== 'popular') params.set('sort', newSort)
      if (newPage > 1) params.set('page', String(newPage))
      if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','))
      if (newFilters.categoryIds && newFilters.categoryIds.length > 0) params.set('categories', newFilters.categoryIds.join(','))
      if (newFilters.priceRange[0] > 0) params.set('priceMin', String(newFilters.priceRange[0]))
      if (newFilters.priceRange[1] < 5000) params.set('priceMax', String(newFilters.priceRange[1]))

      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [router, pathname],
  )

  // Browser back/forward sync
  useEffect(() => {
    setFilters(parseFiltersFromParams(searchParams))
    setSortBy((searchParams.get('sort') as SortOption) || 'popular')
    setCurrentPage(Number(searchParams.get('page')) || 1)
    const search = searchParams.get('search') || ''
    setLocalSearch(search)
    setDebouncedSearch(search)
  }, [searchParams])

  // ── Server-side filtered query ─────────────────────────────────
  const { data, isLoading, error } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
    search: debouncedSearch || undefined,
    brandIds: filters.brands.length > 0 ? filters.brands : undefined,
    categoryIds: filters.categoryIds && filters.categoryIds.length > 0 ? filters.categoryIds : undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
    sortBy: toApiSort(sortBy),
  })

  const products = data ? transformProducts(data.products) : []
  const totalPages = data?.totalPages || 0
  const totalCount = data?.count || 0

  // ── Handlers ───────────────────────────────────────────────────
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrl(newFilters, sortBy, 1, debouncedSearch)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
    updateUrl(filters, newSort, 1, debouncedSearch)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateUrl(filters, sortBy, page, debouncedSearch)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchSubmit = () => {
    setCurrentPage(1)
    setDebouncedSearch(localSearch)
    updateUrl(filters, sortBy, 1, localSearch)
  }

  const clearSearch = () => {
    setLocalSearch('')
    setDebouncedSearch('')
    setCurrentPage(1)
    updateUrl(filters, sortBy, 1, '')
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {debouncedSearch ? `Результати пошуку: "${debouncedSearch}"` : 'Каталог товарів'}
            </h1>
            <p className="text-muted-foreground">
              {debouncedSearch
                ? `Знайдено ${totalCount} товарів`
                : 'Професійна косметика для догляду за волоссям'}
            </p>

            {/* Search Bar */}
            <div className="mt-6 max-w-md">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSearchSubmit()
                }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Пошук товарів..."
                  className="w-full h-11 pl-10 pr-10 bg-background border border-border rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
                    aria-label="Очистити пошук"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-card mb-6" role="alert">
            Помилка завантаження товарів. Перевірте підключення до сервера.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            maxPrice={5000}
            className="w-full lg:w-64 flex-shrink-0"
          />

          {/* Main content */}
          <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                {!isLoading && (
                  <p className="text-sm text-muted-foreground">
                    {totalCount > 0 ? `${totalCount} товарів` : ''}
                  </p>
                )}
                <SortSelect value={sortBy} onChange={handleSortChange} />
              </div>

              {/* Product Grid */}
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
          </div>
        </div>
      </div>
    </main>
  )
}

// Loading fallback
function ShopLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="h-10 w-64 bg-muted animate-pulse rounded" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded mt-2" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  )
}
