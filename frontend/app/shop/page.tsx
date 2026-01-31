'use client'

import { useState, useMemo } from 'react'
import { FilterSidebar, FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { featuredProducts, type Product } from '@/lib/constants/home-data'

// Combine all products for the catalog
const allProducts: Product[] = [
  ...featuredProducts.bestsellers,
  ...featuredProducts.new,
  ...featuredProducts.sale,
]

const PRODUCTS_PER_PAGE = 9

export default function ShopPage() {
  const [filters, setFilters] = useState<FilterState>({
    concerns: [],
    hairTypes: [],
    brands: [],
    priceRange: [0, 5000],
  })
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [currentPage, setCurrentPage] = useState(1)

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
  }, [filters, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  // Reset page when filters change
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Каталог товарів
          </h1>
          <p className="text-muted-foreground">
            Професійна косметика для догляду за волоссям
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Знайдено{' '}
                <span className="font-medium text-foreground">
                  {filteredProducts.length}
                </span>{' '}
                {filteredProducts.length === 1
                  ? 'товар'
                  : filteredProducts.length < 5
                  ? 'товари'
                  : 'товарів'}
              </p>

              <SortSelect value={sortBy} onChange={handleSortChange} />
            </div>

            {/* Product Grid */}
            <ProductGrid products={paginatedProducts} />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
