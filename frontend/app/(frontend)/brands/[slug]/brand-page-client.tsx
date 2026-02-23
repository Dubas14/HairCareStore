'use client'

import { useState } from 'react'
import { BrandHero, BrandInfo } from '@/components/brands'
import { FilterSidebar, type FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, type SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { useProducts, transformProducts } from '@/lib/hooks/use-products'
import type { Brand } from '@/lib/payload/types'

const PRODUCTS_PER_PAGE = 24

function toApiSort(sort: SortOption): 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest' {
  switch (sort) {
    case 'price-asc': return 'price_asc'
    case 'price-desc': return 'price_desc'
    default: return sort
  }
}

interface Props {
  initialBrand: Brand
}

export function BrandPageClient({ initialBrand }: Props) {
  const brand = initialBrand

  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: [0, 5000],
  })
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [currentPage, setCurrentPage] = useState(1)

  // Server-side filtered products
  const { data, isLoading: isLoadingProducts } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
    brandIds: [brand.id],
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
    sortBy: toApiSort(sortBy),
  })

  const products = data ? transformProducts(data.products) : []
  const totalPages = data?.totalPages || 0
  const totalCount = data?.count || 0

  // Reset page when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner */}
      <BrandHero brand={brand} />

      {/* Brand Info (History & Benefits) */}
      <BrandInfo brand={brand} />

      {/* Products Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Товари {brand.name}
          </h2>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <FilterSidebar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              maxPrice={5000}
              className="w-full lg:w-64 flex-shrink-0"
              hideBrandFilter
              hideCategoryFilter
            />

            {/* Main content */}
            <div className="flex-1">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    {isLoadingProducts ? (
                      'Завантаження...'
                    ) : (
                      <>
                        Знайдено{' '}
                        <span className="font-medium text-foreground">
                          {totalCount}
                        </span>{' '}
                        {totalCount === 1
                          ? 'товар'
                          : totalCount < 5
                          ? 'товари'
                          : 'товарів'}
                      </>
                    )}
                  </p>

                  <SortSelect value={sortBy} onChange={handleSortChange} />
                </div>

                {/* Product Grid */}
                <ProductGrid products={products} isLoading={isLoadingProducts} />

                {/* Pagination */}
                {!isLoadingProducts && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
