'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin, Loader2, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { CityOption } from '@/lib/shipping/nova-poshta-types'

interface CityAutocompleteProps {
  value: string
  cityRef: string
  onChange: (name: string, ref: string) => void
  disabled?: boolean
  error?: string
}

export function CityAutocomplete({
  value,
  cityRef,
  onChange,
  disabled,
  error,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<CityOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [isFallback, setIsFallback] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value changes
  useEffect(() => {
    setQuery(value)
  }, [value])

  const fetchCities = useCallback(async (q: string) => {
    if (q.length < 2) {
      setOptions([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/nova-poshta/cities?q=${encodeURIComponent(q)}`)
      const data = await res.json()

      if (data.fallback) {
        setIsFallback(true)
        setOptions([])
        setIsOpen(false)
        return
      }

      setIsFallback(false)
      setOptions(data.cities || [])
      setIsOpen((data.cities || []).length > 0)
      setHighlightIndex(-1)
    } catch {
      setOptions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    // Clear selection if user edits text after selecting
    if (cityRef && val !== value) {
      onChange(val, '')
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCities(val), 300)
  }

  const handleSelect = (city: CityOption) => {
    const displayName = city.area ? `${city.name} (${city.area})` : city.name
    setQuery(displayName)
    onChange(displayName, city.ref)
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || options.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightIndex >= 0 && highlightIndex < options.length) {
          handleSelect(options[highlightIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightIndex(-1)
        break
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightIndex])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Fallback: plain input
  if (isFallback) {
    return (
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value, '')
        }}
        placeholder="Введіть назву міста"
        className={error ? 'border-destructive' : ''}
        disabled={disabled}
      />
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (options.length > 0) setIsOpen(true)
          }}
          placeholder="Введіть назву міста"
          className={cn('pl-9 pr-8', error ? 'border-destructive' : '')}
          disabled={disabled}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
          ) : (
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
          )}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-60 overflow-y-auto"
          role="listbox"
        >
          {options.map((city, i) => (
            <li
              key={city.ref}
              role="option"
              aria-selected={highlightIndex === i}
              className={cn(
                'px-3 py-2.5 cursor-pointer text-sm transition-colors',
                highlightIndex === i ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span className="font-medium">{city.name}</span>
              {city.area && (
                <span className="text-muted-foreground ml-1">({city.area})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
