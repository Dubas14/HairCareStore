'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, ArrowRight, TrendingUp, Loader2, Clock, Tag, Sparkles } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useSearchProducts } from '@/lib/hooks/use-products'
import { getImageUrl } from '@/lib/payload/types'
import { trackSearch } from '@/lib/analytics/events'
import { getCategories, getBrands } from '@/lib/payload/actions'
import type { Category, Brand } from '@/lib/payload/types'

const RECENT_SEARCHES_KEY = 'hair-lab-recent-searches'
const MAX_RECENT_SEARCHES = 5

function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRecentSearch(term: string): void {
  try {
    const searches = getRecentSearches().filter((s) => s !== term)
    searches.unshift(term)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches.slice(0, MAX_RECENT_SEARCHES)))
  } catch { /* ignore */ }
}

function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch { /* ignore */ }
}

export function SearchDialog() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search via Payload CMS
  const { data, isLoading } = useSearchProducts(debouncedQuery)
  const results = data?.products || []

  // Track search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      trackSearch(debouncedQuery)
    }
  }, [debouncedQuery])

  // Load recent searches and suggestions when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setRecentSearches(getRecentSearches())
      // Load categories/brands for suggestions
      getCategories().then(setCategories).catch(() => {})
      getBrands().then(setBrands).catch(() => {})
    } else {
      setQuery('')
      setDebouncedQuery('')
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

  const handleSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm)
  }, [])

  const handleResultClick = useCallback(() => {
    if (debouncedQuery.length >= 2) {
      saveRecentSearch(debouncedQuery)
    }
    closeSearch()
  }, [debouncedQuery, closeSearch])

  const handleViewAll = useCallback(() => {
    if (debouncedQuery.length >= 2) {
      saveRecentSearch(debouncedQuery)
    }
    closeSearch()
  }, [debouncedQuery, closeSearch])

  const handleClearRecent = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  if (!isSearchOpen) return null

  // Filter categories/brands based on input (1+ chars)
  const queryLower = query.toLowerCase().trim()
  const matchedCategories = queryLower.length >= 1
    ? categories.filter((c) => c.name.toLowerCase().includes(queryLower)).slice(0, 4)
    : []
  const matchedBrands = queryLower.length >= 1
    ? brands.filter((b) => b.name.toLowerCase().includes(queryLower)).slice(0, 4)
    : []
  const hasSuggestions = matchedCategories.length > 0 || matchedBrands.length > 0

  // Dynamic popular searches from categories
  const popularSearches = categories.length > 0
    ? categories.slice(0, 5).map((c) => c.name)
    : ['Шампунь', 'Маска для волосся', 'Термозахист', 'Кондиціонер', 'Олія для волосся']

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
                placeholder="Пошук товарів, категорій, брендів..."
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
            {debouncedQuery.length >= 2 ? (
              // Search Results
              <div>
                {/* Quick category/brand suggestions */}
                {hasSuggestions && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {matchedCategories.map((cat) => (
                      <Link
                        key={`cat-${cat.id}`}
                        href={`/categories/${cat.slug}`}
                        onClick={handleResultClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        {cat.name}
                      </Link>
                    ))}
                    {matchedBrands.map((brand) => (
                      <Link
                        key={`brand-${brand.id}`}
                        href={`/brands/${brand.slug}`}
                        onClick={handleResultClick}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        {brand.name}
                      </Link>
                    ))}
                  </div>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Знайдено {results.length} товарів
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {results.slice(0, 8).map((product) => {
                        const price = product.variants?.[0]?.price || 0
                        const thumbnailUrl = getImageUrl(product.thumbnail)
                        return (
                          <Link
                            key={product.id}
                            href={`/products/${product.handle}`}
                            onClick={handleResultClick}
                            className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {thumbnailUrl ? (
                                <Image
                                  src={thumbnailUrl}
                                  alt={product.title}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-neutral-200" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {product.subtitle && (
                                <p className="text-xs text-muted-foreground uppercase">
                                  {product.subtitle}
                                </p>
                              )}
                              <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                {product.title}
                              </h4>
                              <p className="text-sm font-semibold mt-1">
                                {Math.round(price) + ' \u20B4'}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>

                    {/* View All Results */}
                    {results.length > 8 && (
                      <div className="mt-6 text-center">
                        <Link
                          href={`/shop?search=${encodeURIComponent(debouncedQuery)}`}
                          onClick={handleViewAll}
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          Переглянути всі результати ({results.length})
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
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
            ) : queryLower.length >= 1 && hasSuggestions ? (
              // Category/Brand suggestions for short queries
              <div className="space-y-4">
                {matchedCategories.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                      <Tag className="w-4 h-4" />
                      Категорії
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {matchedCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categories/${cat.slug}`}
                          onClick={handleResultClick}
                          className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {matchedBrands.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                      <Sparkles className="w-4 h-4" />
                      Бренди
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {matchedBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brands/${brand.slug}`}
                          onClick={handleResultClick}
                          className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Default: Recent + Popular Searches
              <div className="space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        Недавні пошуки
                      </h3>
                      <button
                        onClick={handleClearRecent}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Очистити
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm transition-colors"
                        >
                          <Clock className="w-3 h-3 opacity-50" />
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
                        className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-sm transition-colors"
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
