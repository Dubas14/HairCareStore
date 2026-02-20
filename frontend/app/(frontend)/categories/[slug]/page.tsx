'use client'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { CategoryHero, Subcategories, PopularProducts, CategoryPromo } from '@/components/categories'
import { FilterSidebar, type FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, type SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useProducts, transformProducts } from '@/lib/hooks/use-products'
import { getCategoryBySlug } from '@/lib/payload/actions'
import type { Category } from '@/lib/payload/types'

const PRODUCTS_PER_PAGE = 24

function toApiSort(sort: SortOption): 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'newest' {
  switch (sort) {
    case 'price-asc': return 'price_asc'
    case 'price-desc': return 'price_desc'
    default: return sort
  }
}

function parseFiltersFromParams(params: URLSearchParams): FilterState {
  return {
    brands: params.get('brands')?.split(',').filter(Boolean) || [],
    priceRange: [
      Number(params.get('priceMin')) || 0,
      Number(params.get('priceMax')) || 5000,
    ],
  }
}

function CategoryContent() {
  const params = useParams()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Category content from CMS
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoadingCategory, setIsLoadingCategory] = useState(true)

  // Read initial state from URL
  const urlPage = Number(searchParams.get('page')) || 1
  const urlSort = (searchParams.get('sort') as SortOption) || 'popular'

  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromParams(searchParams))
  const [sortBy, setSortBy] = useState<SortOption>(urlSort)
  const [currentPage, setCurrentPage] = useState(urlPage)

  // Sync URL params
  const updateUrl = useCallback((newFilters: FilterState, newSort: SortOption, newPage: number) => {
    const params = new URLSearchParams()
    if (newSort !== 'popular') params.set('sort', newSort)
    if (newPage > 1) params.set('page', String(newPage))
    if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','))
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
  }, [searchParams])

  // Fetch category from Payload CMS
  useEffect(() => {
    async function fetchCategory() {
      setIsLoadingCategory(true)
      try {
        const data = await getCategoryBySlug(slug)
        setCategory(data)
      } catch (error) {
        console.error('Error fetching category:', error)
      } finally {
        setIsLoadingCategory(false)
      }
    }
    if (slug) {
      fetchCategory()
    }
  }, [slug])

  // Server-side filtered products
  const { data, isLoading: isLoadingProducts } = useProducts({
    limit: PRODUCTS_PER_PAGE,
    page: currentPage,
    categoryIds: category ? [category.id] : undefined,
    brandIds: filters.brands.length > 0 ? filters.brands : undefined,
    minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
    maxPrice: filters.priceRange[1] < 5000 ? filters.priceRange[1] : undefined,
    sortBy: toApiSort(sortBy),
  })

  const products = data ? transformProducts(data.products) : []
  const totalPages = data?.totalPages || 0
  const totalCount = data?.count || 0

  // Popular products (first page, sorted by popular, limited to 4)
  const { data: popularData } = useProducts({
    limit: 4,
    categoryIds: category ? [category.id] : undefined,
    sortBy: 'popular',
  })
  const popularProducts = popularData ? transformProducts(popularData.products) : []

  // Handlers
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrl(newFilters, sortBy, 1)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setCurrentPage(1)
    updateUrl(filters, newSort, 1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateUrl(filters, sortBy, page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Loading state
  if (isLoadingCategory) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    )
  }

  // Category not found
  if (!category) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Категорію не знайдено
          </h1>
          <p className="text-muted-foreground">
            На жаль, категорія &quot;{slug}&quot; не існує або була видалена.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={[
          { label: 'Каталог', href: '/shop' },
          { label: category.name },
        ]} />
      </div>

      {/* Hero Banner */}
      <CategoryHero category={category} />

      {/* Subcategories */}
      {category.subcategories && category.subcategories.length > 0 && (
        <Subcategories
          subcategories={category.subcategories}
          parentColor={category.accentColor}
        />
      )}

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <PopularProducts
          products={popularProducts}
          title={`Популярні ${category.name.toLowerCase()}`}
          accentColor={category.accentColor}
        />
      )}

      {/* Promo Block */}
      {category.promoBlock && (
        <CategoryPromo
          promoBlock={category.promoBlock}
          accentColor={category.accentColor}
        />
      )}

      {/* All Products Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <ScrollReveal variant="fade-up" duration={500}>
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              Всі товари
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

// Loading fallback for Suspense
function CategoryLoading() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </main>
  )
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryContent />
    </Suspense>
  )
}
