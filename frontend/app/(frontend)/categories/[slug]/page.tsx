'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { CategoryHero, Subcategories, PopularProducts, CategoryPromo } from '@/components/categories'
import { FilterSidebar, FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useProductsByCategory, transformProducts } from '@/lib/hooks/use-products'
import { getCategoryBySlug } from '@/lib/payload/actions'
import type { Category } from '@/lib/payload/types'

const PRODUCTS_PER_PAGE = 12

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string

  // Category content from CMS
  const [category, setCategory] = useState<Category | null>(null)
  const [isLoadingCategory, setIsLoadingCategory] = useState(true)

  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({
    concerns: [],
    hairTypes: [],
    brands: [],
    priceRange: [0, 5000],
  })
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [currentPage, setCurrentPage] = useState(1)

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

  // Fetch products by category
  const { data: productsData, isLoading: isLoadingProducts } = useProductsByCategory(slug)

  // Convert to frontend format
  const allProducts = useMemo(() => {
    if (!productsData?.products) return []
    return transformProducts(productsData.products)
  }, [productsData?.products])

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

  // Popular products (first 4 with highest rating)
  const popularProducts = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4)
  }, [allProducts])

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
                          {filteredProducts.length}
                        </span>{' '}
                        {filteredProducts.length === 1
                          ? 'товар'
                          : filteredProducts.length < 5
                          ? 'товари'
                          : 'товарів'}
                      </>
                    )}
                  </p>

                  <SortSelect value={sortBy} onChange={handleSortChange} />
                </div>

                {/* Product Grid */}
                <ProductGrid products={paginatedProducts} isLoading={isLoadingProducts} />

                {/* Pagination */}
                {!isLoadingProducts && totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
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
