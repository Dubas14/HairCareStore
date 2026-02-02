'use client'

import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { BrandHero, BrandInfo } from '@/components/brands'
import { FilterSidebar, FilterState } from '@/components/shop/filter-sidebar'
import { ProductGrid } from '@/components/shop/product-grid'
import { SortSelect, SortOption } from '@/components/shop/sort-select'
import { Pagination } from '@/components/shop/pagination'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { useProductsByBrand } from '@/lib/medusa/hooks'
import { toFrontendProducts } from '@/lib/medusa/adapters'
import { getBrandBySlug, Brand } from '@/lib/strapi/client'

const PRODUCTS_PER_PAGE = 12

export default function BrandPage() {
  const params = useParams()
  const slug = params.slug as string

  // Brand content from Strapi
  const [brand, setBrand] = useState<Brand | null>(null)
  const [isLoadingBrand, setIsLoadingBrand] = useState(true)

  // Filters and sorting
  const [filters, setFilters] = useState<FilterState>({
    concerns: [],
    hairTypes: [],
    brands: [],
    priceRange: [0, 5000],
  })
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch brand from Strapi
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

  // Fetch products from Medusa by brand
  const { data: productsData, isLoading: isLoadingProducts } = useProductsByBrand({
    brandHandle: brand?.medusaHandle || slug,
    limit: 100,
  })

  // Convert to frontend format
  const allProducts = useMemo(() => {
    if (!productsData?.products) return []
    return toFrontendProducts(productsData.products)
  }, [productsData?.products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts]

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
