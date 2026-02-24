'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Building2, Package, Loader2, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { WarehouseOption } from '@/lib/shipping/nova-poshta-types'

interface WarehouseSelectProps {
  cityRef: string
  value: string
  warehouseRef: string
  onChange: (description: string, ref: string) => void
  disabled?: boolean
  error?: string
}

export function WarehouseSelect({
  cityRef,
  value,
  warehouseRef,
  onChange,
  disabled,
  error,
}: WarehouseSelectProps) {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<WarehouseOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [isFallback, setIsFallback] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync external value
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Load warehouses when cityRef changes
  useEffect(() => {
    if (!cityRef) {
      setOptions([])
      setIsOpen(false)
      return
    }

    // Reset selection if city changed
    setQuery('')
    onChange('', '')

    loadWarehouses(cityRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityRef])

  const loadWarehouses = useCallback(async (ref: string, search?: string) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ cityRef: ref })
      if (search) params.set('q', search)

      const res = await fetch(`/api/nova-poshta/warehouses?${params}`)
      const data = await res.json()

      if (data.fallback) {
        setIsFallback(true)
        setOptions([])
        return
      }

      setIsFallback(false)
      setOptions(data.warehouses || [])
    } catch {
      setOptions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    // Clear selection if user edits text
    if (warehouseRef && val !== value) {
      onChange(val, '')
    }

    if (!cityRef) return

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadWarehouses(cityRef, val || undefined)
    }, 300)
  }

  const handleSelect = (wh: WarehouseOption) => {
    setQuery(wh.description)
    onChange(wh.description, wh.ref)
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

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const isDisabled = disabled || !cityRef

  // Fallback: plain input
  if (isFallback) {
    return (
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(e.target.value, '')
        }}
        placeholder={cityRef ? 'Номер або адреса відділення' : 'Спочатку оберіть місто'}
        className={error ? 'border-destructive' : ''}
        disabled={isDisabled}
      />
    )
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (options.length > 0 && cityRef) setIsOpen(true)
          }}
          placeholder={cityRef ? 'Пошук відділення або поштомату' : 'Спочатку оберіть місто'}
          className={cn('pl-9 pr-8', error ? 'border-destructive' : '')}
          disabled={isDisabled}
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
          {options.map((wh, i) => (
            <li
              key={wh.ref}
              role="option"
              aria-selected={highlightIndex === i}
              className={cn(
                'px-3 py-2.5 cursor-pointer text-sm transition-colors flex items-start gap-2',
                highlightIndex === i ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              )}
              onClick={() => handleSelect(wh)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              {wh.category === 'postomat' ? (
                <Package className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              ) : (
                <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              )}
              <div className="min-w-0">
                <span className="font-medium block truncate">{wh.description}</span>
                <span className="text-xs text-muted-foreground truncate block">{wh.shortAddress}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && options.length === 0 && !isLoading && cityRef && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md p-3 text-sm text-muted-foreground text-center">
          Відділення не знайдено
        </div>
      )}
    </div>
  )
}
