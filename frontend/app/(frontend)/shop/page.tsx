'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Loader2, Search, Sparkles, X } from 'lucide-react'
import { FilterSidebar, type FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, type SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { useProducts } from '@/lib/hooks/use-products'
import { transformProducts } from '@/lib/payload/types'

const PRODUCTS_PER_PAGE = 24

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

function toApiSort(sort: SortOption): 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest' {
  switch (sort) {
    case 'price-asc':
      return 'price_asc'
    case 'price-desc':
      return 'price_desc'
    default:
      return sort
  }
}

function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const searchQuery = searchParams.get('search') || ''
  const urlPage = Number(searchParams.get('page')) || 1
  const urlSort = (searchParams.get('sort') as SortOption) || 'popular'

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams))
  const [sortBy, setSortBy] = useState<SortOption>(urlSort)
  const [currentPage, setCurrentPage] = useState(urlPage)
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(localSearch), 400)
    return () => clearTimeout(timer)
  }, [localSearch])

  const updateUrl = useCallback(
    (newFilters: FilterState, newSort: SortOption, newPage: number, newSearch: string) => {
      const params = new URLSearchParams()
      if (newSearch) params.set('search', newSearch)
      if (newSort !== 'popular') params.set('sort', newSort)
      if (newPage > 1) params.set('page', String(newPage))
      if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','))
      if (newFilters.categoryIds && newFilters.categoryIds.length > 0) {
        params.set('categories', newFilters.categoryIds.join(','))
      }
      if (newFilters.priceRange[0] > 0) params.set('priceMin', String(newFilters.priceRange[0]))
      if (newFilters.priceRange[1] < 5000) params.set('priceMax', String(newFilters.priceRange[1]))

      const qs = params.toString()
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [router, pathname],
  )

  useEffect(() => {
    setFilters(parseFiltersFromParams(searchParams))
    setSortBy((searchParams.get('sort') as SortOption) || 'popular')
    setCurrentPage(Number(searchParams.get('page')) || 1)
    const search = searchParams.get('search') || ''
    setLocalSearch(search)
    setDebouncedSearch(search)
  }, [searchParams])

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
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf7f2_0%,#faf7f3_34%,#ffffff_100%)]">
      <section className="relative overflow-hidden border-b border-black/6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(42,157,143,0.12),_transparent_22%),radial-gradient(circle_at_85%_10%,_rgba(212,163,115,0.12),_transparent_18%)]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-foreground/58 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
              <Sparkles className="h-3.5 w-3.5 text-[#2A9D8F]" />
              Каталог
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[0.94] tracking-[-0.06em] text-foreground md:text-5xl lg:text-6xl">
              {debouncedSearch ? `Результати пошуку: "${debouncedSearch}"` : 'Каталог товарів'}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              {debouncedSearch
                ? `Знайдено ${totalCount} варіантів догляду, які відповідають вашому запиту.`
                : 'Професійний догляд для волосся. Шампуні, маски, стайлінг, засоби для фарбування та відновлення.'}
            </p>
          </div>

          <div className="mt-8 max-w-2xl rounded-[2rem] border border-black/8 bg-white p-4 shadow-[0_18px_44px_rgba(0,0,0,0.05)] md:p-5">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSearchSubmit()
              }}
              className="flex flex-col gap-3 md:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Пошук товарів, брендів або бажаного ефекту"
                  className="h-14 w-full rounded-full border border-black/8 bg-[#fcfaf7] pl-12 pr-12 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-[#2A9D8F] focus:ring-2 focus:ring-[#2A9D8F]/15"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-black/5"
                    aria-label="Очистити пошук"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#1A1A1A] px-8 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                Знайти догляд
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {error && (
          <div className="mb-6 rounded-[1.5rem] border border-[#BC4749]/20 bg-[#BC4749]/8 px-4 py-4 text-sm text-[#8c3133]" role="alert">
            Помилка завантаження товарів. Перевірте підключення до сервера.
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_18px_44px_rgba(0,0,0,0.05)] md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/48">
              Поточний вибір
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
              {!isLoading ? `${totalCount} товарів у добірці` : 'Підбираємо найкращі варіанти'}
            </p>
          </div>
          <SortSelect value={sortBy} onChange={handleSortChange} />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            maxPrice={5000}
            className="w-full lg:w-[300px] flex-shrink-0"
            search={debouncedSearch}
          />

          <div className="flex-1">
            <ProductGrid products={products} isLoading={isLoading} />

            {!isLoading && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function ShopLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Готуємо каталог...</p>
        </div>
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
