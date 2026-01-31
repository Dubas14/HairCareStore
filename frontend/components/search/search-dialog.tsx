'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Search, X, ArrowRight, Clock, TrendingUp } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { featuredProducts, type Product } from '@/lib/constants/home-data'
import { cn } from '@/lib/utils'

// Combine all products for search
const allProducts: Product[] = [
  ...featuredProducts.bestsellers,
  ...featuredProducts.new,
  ...featuredProducts.sale,
]

const popularSearches = [
  'Шампунь відновлюючий',
  'Маска для волосся',
  'Термозахист',
  'Проти випадіння',
  'Для фарбованого волосся',
]

const recentSearches = [
  'Elgon шампунь',
  'Inebrya маска',
]

export function SearchDialog() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search function
  const searchProducts = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const lowerQuery = searchQuery.toLowerCase()

    // Simulate API delay
    setTimeout(() => {
      const filtered = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.brand.toLowerCase().includes(lowerQuery)
      )
      setResults(filtered)
      setIsSearching(false)
    }, 150)
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, searchProducts])

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isSearchOpen])

  // Lock body scroll when open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isSearchOpen])

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isSearchOpen, closeSearch])

  if (!isSearchOpen) return null

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm)
  }

  const handleResultClick = () => {
    closeSearch()
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeSearch}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-x-0 top-0 bg-background shadow-xl max-h-[85vh] overflow-hidden flex flex-col animate-fadeInUp">
        {/* Search Input */}
        <div className="border-b p-4">
          <div className="container mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Пошук товарів..."
                className="w-full h-12 pl-12 pr-12 text-lg bg-muted rounded-input focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded-full"
                  aria-label="Очистити пошук"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-4">
            {query ? (
              // Search Results
              <div>
                {isSearching ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Знайдено {results.length} товарів
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={handleResultClick}
                          className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                        >
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground uppercase">
                              {product.brand}
                            </p>
                            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-sm font-semibold mt-1">
                              {product.price} ₴
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* View All Results */}
                    <div className="mt-6 text-center">
                      <Link
                        href={`/shop?search=${encodeURIComponent(query)}`}
                        onClick={handleResultClick}
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        Переглянути всі результати
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg font-medium mb-2">Нічого не знайдено</p>
                    <p className="text-muted-foreground">
                      Спробуйте інший пошуковий запит
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Suggestions
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      Останні пошуки
                    </h3>
                    <div className="space-y-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-4">
                    <TrendingUp className="w-4 h-4" />
                    Популярні запити
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={closeSearch}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Закрити пошук"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
