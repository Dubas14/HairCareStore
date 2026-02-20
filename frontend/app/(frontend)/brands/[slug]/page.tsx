'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { BrandHero, BrandInfo } from '@/components/brands'
import { FilterSidebar, type FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, type SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useProducts, transformProducts } from '@/lib/hooks/use-products'
import { getBrandBySlug } from '@/lib/payload/actions'
import type { Brand } from '@/lib/payload/types'

const PRODUCTS_PER_PAGE = 24

function toApiSort(sort: SortOption): 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest' {
  switch (sort) {
    case 'price-asc': return 'price_asc'
    case 'price-desc': return 'price_desc'
    default: return sort
  }
}

export default function BrandPage() {
  const params = useParams()
  const slug = params.slug as string

  // Brand content from CMS
  const [brand, setBrand] = useState<Brand | null>(null)
  const [isLoadingBrand, setIsLoadingBrand] = useState(true)

  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: [0, 5000],
  })
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch brand from Payload CMS
  useEffect(() => {
    async function fetchBrand() {
      setIsLoadingBrand(true)
      try {
        const data = await getBrandBySlug(slug)
        setBrand(data)
      } catch (error) {
        console.error('Error fetching brand:', error)
      } finally {
        setIsLoadingBrand(false)
      }
    }
    if (slug) {
      fetchBrand()
    }
  }, [slug])

  // Server-side filtered products
  const { data, isLoading: isLoadingProducts } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
    brandIds: brand ? [brand.id] : undefined,
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

  // Loading state
  if (isLoadingBrand) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  // Brand not found
  if (!brand) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Бренд не знайдено
          </h1>
          <p className="text-muted-foreground">
            На жаль, бренд &quot;{slug}&quot; не існує або був видалений.
          </p>
        </div>
      </main>
    )
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
          <ScrollReveal variant="fade-up" duration={500}>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              Товари {brand.name}
            </h2>
          </ScrollReveal>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <ScrollReveal variant="fade-right" delay={100} duration={600}>
              <FilterSidebar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                maxPrice={5000}
                className="w-full lg:w-64 flex-shrink-0"
                hideBrandFilter
                hideCategoryFilter
              />
            </ScrollReveal>

            {/* Main content */}
            <ScrollReveal variant="fade-up" delay={200} duration={600} className="flex-1">
              <div>
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
            </ScrollReveal>
          </div>
        </div>
      </section>
    </main>
  )
}
