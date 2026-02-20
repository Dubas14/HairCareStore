'use client'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'
import { FilterSidebar, FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { useProducts, useSearchProducts, transformProducts } from '@/lib/hooks/use-products'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

const PRODUCTS_PER_PAGE = 12

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    concerns: params.get('concerns')?.split(',').filter(Boolean) || [],
    hairTypes: params.get('hairTypes')?.split(',').filter(Boolean) || [],
    brands: params.get('brands')?.split(',').filter(Boolean) || [],
    priceRange: [
      Number(params.get('priceMin')) || 0,
      Number(params.get('priceMax')) || 5000,
    ],
  }
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Read state from URL
  const searchQuery = searchParams.get('search') || ''
  const urlPage = Number(searchParams.get('page')) || 1
  const urlSort = (searchParams.get('sort') as SortOption) || 'popular'

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams))
  const [sortBy, setSortBy] = useState<SortOption>(urlSort)
  const [currentPage, setCurrentPage] = useState(urlPage)
  const [localSearch, setLocalSearch] = useState(searchQuery)

  // Sync URL params when state changes
  const updateUrl = useCallback((newFilters: FilterState, newSort: SortOption, newPage: number, newSearch: string) => {
    const params = new URLSearchParams()

    if (newSearch) params.set('search', newSearch)
    if (newSort !== 'popular') params.set('sort', newSort)
    if (newPage > 1) params.set('page', String(newPage))
    if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','))
    if (newFilters.concerns.length > 0) params.set('concerns', newFilters.concerns.join(','))
    if (newFilters.hairTypes.length > 0) params.set('hairTypes', newFilters.hairTypes.join(','))
    if (newFilters.priceRange[0] > 0) params.set('priceMin', String(newFilters.priceRange[0]))
    if (newFilters.priceRange[1] < 5000) params.set('priceMax', String(newFilters.priceRange[1]))

    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  // Sync from URL on browser back/forward
  useEffect(() => {
    setFilters(parseFiltersFromParams(searchParams))
    setSortBy((searchParams.get('sort') as SortOption) || 'popular')
    setCurrentPage(Number(searchParams.get('page')) || 1)
    setLocalSearch(searchParams.get('search') || '')
  }, [searchParams])

  // Fetch products
  // limit: 500 is a practical cap for client-side filtering; ideally migrate to server-side filtering/pagination via Payload API
  const { data, isLoading, error } = useProducts({ limit: 500 })

  // Search results if there's a query
  const { data: searchData, isLoading: isSearching } = useSearchProducts(localSearch)

  // Convert products to frontend format
  const allProducts = useMemo(() => {
    if (localSearch && searchData?.products) {
      return transformProducts(searchData.products)
    }
    if (!data?.products) return []
    return transformProducts(data.products)
  }, [data?.products, searchData?.products, localSearch])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter((product) =>
        filters.brands.some(
          (brand) => product.brand.toLowerCase().replace(/\s+/g, '-') === brand
        )
      )
    }

    // Apply price filter
    result = result.filter(
      (product) =>
        product.price >= filters.priceRange[0] &&
        product.price <= filters.priceRange[1]
    )

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort((a, b) => (b.badge === 'Новинка' ? 1 : 0) - (a.badge === 'Новинка' ? 1 : 0))
        break
      case 'popular':
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }

    return result
  }, [allProducts, filters, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  )

  // Handlers that update both state and URL
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrl(newFilters, sortBy, 1, localSearch)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
    updateUrl(filters, newSort, 1, localSearch)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateUrl(filters, sortBy, page, localSearch)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearSearch = () => {
    setLocalSearch('')
    setCurrentPage(1)
    updateUrl(filters, sortBy, 1, '')
  }

  const isLoadingProducts = localSearch ? isSearching : isLoading

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <ScrollReveal variant="fade-down" duration={500}>
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {localSearch ? `Результати пошуку: "${localSearch}"` : 'Каталог товарів'}
            </h1>
            <p className="text-muted-foreground">
              {localSearch
                ? `Знайдено ${filteredProducts.length} товарів`
                : 'Професійна косметика для догляду за волоссям'}
            </p>

            {/* Search Bar */}
            <div className="mt-6 max-w-md">
              <div className="relative">
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
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
                    aria-label="Очистити пошук"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-card mb-6" role="alert">
            Помилка завантаження товарів. Перевірте підключення до сервера.
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <ScrollReveal variant="fade-right" delay={100} duration={600}>
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              maxPrice={5000}
              className="w-full lg:w-64 flex-shrink-0"
            />
          </ScrollReveal>

          {/* Main content */}
          <ScrollReveal variant="fade-up" delay={200} duration={600} className="flex-1">
            <div>
              {/* Toolbar */}
              <div className="flex sm:items-center justify-end mb-6">
                <SortSelect value={sortBy} onChange={handleSortChange} />
              </div>

              {/* Product Grid */}
              <ProductGrid products={paginatedProducts} isLoading={isLoadingProducts} />

              {/* Pagination */}
              {!isLoadingProducts && totalPages > 1 && (
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </ScrollReveal>
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
