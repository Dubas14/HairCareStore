'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  getShippingConfig,
  updateShippingConfig,
  adminSearchCities,
  adminGetWarehouses,
} from '@/app/actions/shipping'
import type { CityOption, WarehouseOption } from '@/lib/shipping/nova-poshta-types'
import '../loyalty/loyalty-admin.scss'

// ─── Types ───────────────────────────────────────────────────────────

export interface ShippingMethodFull {
  id?: string
  methodId: string
  carrier: string
  name: string
  price: number
  currency: 'UAH' | 'EUR' | 'PLN' | 'USD'
  freeAbove?: number | null
  estimatedDays?: number | null
  isActive: boolean
}

export interface ShippingZone {
  id?: string
  name: string
  isActive: boolean
  countries: string[]
  methods: ShippingMethodFull[]
}

export interface NovaPoshtaSender {
  cityRef?: string
  cityName?: string
  warehouseRef?: string
  warehouseName?: string
  senderPhone?: string
}

// ─── Constants ────────────────────────────────────────────────────────

const COUNTRY_LABELS: Record<string, string> = {
  UA: 'Україна', PL: 'Польща', DE: 'Німеччина', FR: 'Франція',
  IT: 'Італія', ES: 'Іспанія', CZ: 'Чехія', SK: 'Словаччина',
  RO: 'Румунія', HU: 'Угорщина', LT: 'Литва', LV: 'Латвія',
  EE: 'Естонія', BG: 'Болгарія', AT: 'Австрія', GB: 'Великобританія',
}

const ALL_COUNTRIES = Object.keys(COUNTRY_LABELS)

const CURRENCY_OPTIONS = ['UAH', 'EUR', 'PLN', 'USD'] as const

const emptyMethod = (): ShippingMethodFull => ({
  methodId: '',
  carrier: '',
  name: '',
  price: 0,
  currency: 'UAH',
  freeAbove: null,
  estimatedDays: null,
  isActive: true,
})

const emptyZone = (): ShippingZone => ({
  name: '',
  isActive: true,
  countries: [],
  methods: [],
})

// ─── SVG Icons ────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: 'transform 0.2s ease', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const PackageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)
const GlobeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const BuildingIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="8.01" y2="6" /><line x1="16" y1="6" x2="16.01" y2="6" />
    <line x1="12" y1="6" x2="12.01" y2="6" /><line x1="8" y1="10" x2="8.01" y2="10" />
    <line x1="16" y1="10" x2="16.01" y2="10" /><line x1="12" y1="10" x2="12.01" y2="10" />
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ─── City Search Combobox ─────────────────────────────────────────────

function AdminCitySearch({ value, onSelect, disabled }: {
  value: string
  onSelect: (city: CityOption) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<CityOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQuery(value) }, [value])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setOptions([]); setIsOpen(false); return }
    setIsLoading(true)
    try {
      const cities = await adminSearchCities(q)
      setOptions(cities)
      setIsOpen(cities.length > 0)
      setHighlightIndex(-1)
    } catch { setOptions([]) }
    finally { setIsLoading(false) }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 300)
  }

  const handleSelect = (city: CityOption) => {
    setQuery(city.area ? `${city.name} (${city.area})` : city.name)
    onSelect(city)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || options.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((p) => (p < options.length - 1 ? p + 1 : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((p) => (p > 0 ? p - 1 : options.length - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (highlightIndex >= 0) handleSelect(options[highlightIndex]) }
    else if (e.key === 'Escape') setIsOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (options.length > 0) setIsOpen(true) }}
          placeholder="Почніть вводити назву міста..."
          disabled={disabled}
          autoComplete="off"
          style={{ paddingLeft: 34 }}
        />
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-base-400)', pointerEvents: 'none' }}>
          {isLoading
            ? <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--color-base-200)', borderTopColor: 'var(--color-sea-500)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <SearchIcon />}
        </span>
      </div>
      {isOpen && options.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-base-0)', border: '1px solid var(--color-base-200)',
          borderRadius: 'var(--hl-radius-sm)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          maxHeight: 220, overflowY: 'auto', marginTop: 2,
        }}>
          {options.map((city, i) => (
            <div
              key={city.ref}
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setHighlightIndex(i)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                background: highlightIndex === i ? 'rgba(91,196,196,0.08)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontWeight: 500 }}>{city.name}</span>
              {city.area && <span style={{ color: 'var(--color-base-400)', marginLeft: 6, fontSize: 12 }}>({city.area})</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Warehouse Search Combobox ────────────────────────────────────────

function AdminWarehouseSearch({ cityRef, value, onSelect, disabled }: {
  cityRef: string
  value: string
  onSelect: (wh: WarehouseOption) => void
  disabled?: boolean
}) {
  const [query, setQuery] = useState(value)
  const [options, setOptions] = useState<WarehouseOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (!cityRef) { setOptions([]); return }
    loadWarehouses(cityRef)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityRef])

  const loadWarehouses = async (ref: string, search?: string) => {
    setIsLoading(true)
    try {
      const whs = await adminGetWarehouses(ref, search)
      setOptions(whs)
    } catch { setOptions([]) }
    finally { setIsLoading(false) }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    if (!cityRef) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => loadWarehouses(cityRef, v || undefined), 300)
  }

  const handleSelect = (wh: WarehouseOption) => {
    setQuery(wh.description)
    onSelect(wh)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || options.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((p) => (p < options.length - 1 ? p + 1 : 0)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((p) => (p > 0 ? p - 1 : options.length - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (highlightIndex >= 0) handleSelect(options[highlightIndex]) }
    else if (e.key === 'Escape') setIsOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (options.length > 0 && cityRef) setIsOpen(true) }}
          placeholder={cityRef ? 'Пошук відділення...' : 'Спочатку оберіть місто'}
          disabled={disabled || !cityRef}
          autoComplete="off"
          style={{ paddingLeft: 34 }}
        />
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-base-400)', pointerEvents: 'none' }}>
          {isLoading
            ? <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid var(--color-base-200)', borderTopColor: 'var(--color-sea-500)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            : <BuildingIcon />}
        </span>
      </div>
      {isOpen && options.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-base-0)', border: '1px solid var(--color-base-200)',
          borderRadius: 'var(--hl-radius-sm)', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          maxHeight: 220, overflowY: 'auto', marginTop: 2,
        }}>
          {options.map((wh, i) => (
            <div
              key={wh.ref}
              onClick={() => handleSelect(wh)}
              onMouseEnter={() => setHighlightIndex(i)}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: 13,
                background: highlightIndex === i ? 'rgba(91,196,196,0.08)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <span style={{ fontWeight: 500 }}>{wh.description}</span>
              <span style={{ display: 'block', color: 'var(--color-base-400)', fontSize: 11, marginTop: 1 }}>{wh.shortAddress}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Country Picker ───────────────────────────────────────────────────

function CountryPicker({ selected, onChange }: {
  selected: string[]
  onChange: (countries: string[]) => void
}) {
  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code))
    } else {
      onChange([...selected, code])
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {ALL_COUNTRIES.map((code) => {
        const active = selected.includes(code)
        return (
          <button
            key={code}
            type="button"
            onClick={() => toggle(code)}
            style={{
              padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: '1px solid',
              borderColor: active ? 'var(--color-sea-400)' : 'var(--color-base-200)',
              background: active ? 'rgba(91,196,196,0.1)' : 'transparent',
              color: active ? 'var(--color-sea-600)' : 'var(--color-base-500)',
              transition: 'all 0.15s ease',
            }}
          >
            {code} — {COUNTRY_LABELS[code]}
          </button>
        )
      })}
    </div>
  )
}

// ─── Method Row ───────────────────────────────────────────────────────

function MethodRow({ method, index, onChange, onRemove }: {
  method: ShippingMethodFull
  index: number
  onChange: (field: keyof ShippingMethodFull, value: unknown) => void
  onRemove: () => void
}) {
  const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4 }
  const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--color-base-400)', textTransform: 'uppercase', letterSpacing: '0.4px' }
  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 'var(--hl-radius-sm)', border: '1px solid var(--color-base-200)',
    background: 'var(--color-base-0)', color: 'var(--color-base-700)', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', width: '100%',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  return (
    <tr>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
        <input
          style={{ ...inputStyle, width: 120 }}
          value={method.methodId}
          onChange={(e) => onChange('methodId', e.target.value)}
          placeholder="nova-poshta"
        />
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
        <input
          style={{ ...inputStyle, width: 100 }}
          value={method.carrier}
          onChange={(e) => onChange('carrier', e.target.value)}
          placeholder="Nova Poshta"
        />
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
        <input
          style={{ ...inputStyle, width: 140 }}
          value={method.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Нова Пошта"
        />
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <input
            style={{ ...inputStyle, width: 70 }}
            type="number"
            min="0"
            value={method.price}
            onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
          />
          <select
            style={{ ...selectStyle, width: 70 }}
            value={method.currency}
            onChange={(e) => onChange('currency', e.target.value)}
          >
            {CURRENCY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
        <input
          style={{ ...inputStyle, width: 80 }}
          type="number"
          min="0"
          value={method.freeAbove ?? ''}
          onChange={(e) => onChange('freeAbove', e.target.value ? parseFloat(e.target.value) : null)}
          placeholder="—"
        />
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle' }}>
        <input
          style={{ ...inputStyle, width: 60 }}
          type="number"
          min="1"
          value={method.estimatedDays ?? ''}
          onChange={(e) => onChange('estimatedDays', e.target.value ? parseInt(e.target.value) : null)}
          placeholder="—"
        />
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => onChange('isActive', !method.isActive)}
          className={`loyalty-admin__toggle loyalty-admin__toggle--${method.isActive ? 'on' : 'off'}`}
          style={{ width: 36, height: 20 }}
          title={method.isActive ? 'Активний' : 'Неактивний'}
        />
      </td>
      <td style={{ padding: '8px 10px', verticalAlign: 'middle', textAlign: 'center' }}>
        <button
          type="button"
          onClick={onRemove}
          title="Видалити"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 'var(--hl-radius-sm)',
            border: '1px solid rgba(212,165,165,0.3)', background: 'rgba(212,165,165,0.08)',
            color: '#b06060', cursor: 'pointer',
          }}
        >
          <TrashIcon />
        </button>
      </td>
      {/* suppress unused fieldStyle/labelStyle lint */}
      <td style={{ display: 'none' }}>{JSON.stringify(fieldStyle)}{JSON.stringify(labelStyle)}</td>
    </tr>
  )
}

// ─── Zone Card ────────────────────────────────────────────────────────

function ZoneCard({ zone, index, onChange, onRemove }: {
  zone: ShippingZone
  index: number
  onChange: (updated: ShippingZone) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const updateMethod = (mi: number, field: keyof ShippingMethodFull, value: unknown) => {
    const methods = zone.methods.map((m, i) => i === mi ? { ...m, [field]: value } : m)
    onChange({ ...zone, methods })
  }

  const addMethod = () => onChange({ ...zone, methods: [...zone.methods, emptyMethod()] })
  const removeMethod = (mi: number) => onChange({ ...zone, methods: zone.methods.filter((_, i) => i !== mi) })

  const activeMethods = zone.methods.filter((m) => m.isActive).length

  return (
    <div style={{
      background: 'var(--color-base-0)', border: '1px solid var(--color-base-200)',
      borderRadius: 'var(--hl-radius-lg)', marginBottom: 12, overflow: 'hidden',
    }}>
      {/* Zone header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          cursor: 'pointer', userSelect: 'none',
          borderBottom: expanded ? '1px solid var(--color-base-200)' : 'none',
          background: expanded ? 'rgba(91,196,196,0.02)' : 'transparent',
          transition: 'background 0.15s ease',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <span style={{ fontWeight: 700, color: 'var(--color-base-400)', fontSize: 12, minWidth: 20 }}>#{index + 1}</span>
        <input
          value={zone.name}
          onChange={(e) => { e.stopPropagation(); onChange({ ...zone, name: e.target.value }) }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Назва зони"
          style={{
            flex: 1, padding: '5px 10px', borderRadius: 'var(--hl-radius-sm)',
            border: '1px solid var(--color-base-200)', background: 'var(--color-base-50)',
            fontSize: 14, fontWeight: 600, color: 'var(--color-base-700)',
            outline: 'none', fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {zone.countries.length > 0 && (
            <span style={{
              fontSize: 11, color: 'var(--color-base-400)', background: 'var(--color-base-100)',
              padding: '2px 8px', borderRadius: 10,
            }}>
              {zone.countries.join(', ')}
            </span>
          )}
          <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
            background: activeMethods > 0 ? 'rgba(91,196,196,0.1)' : 'var(--color-base-100)',
            color: activeMethods > 0 ? 'var(--color-sea-600)' : 'var(--color-base-400)',
          }}>
            {zone.methods.length} метод{zone.methods.length !== 1 ? 'ів' : ''}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange({ ...zone, isActive: !zone.isActive }) }}
            className={`loyalty-admin__toggle loyalty-admin__toggle--${zone.isActive ? 'on' : 'off'}`}
            style={{ width: 36, height: 20 }}
            title={zone.isActive ? 'Активна' : 'Неактивна'}
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            title="Видалити зону"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 'var(--hl-radius-sm)',
              border: '1px solid rgba(212,165,165,0.3)', background: 'rgba(212,165,165,0.08)',
              color: '#b06060', cursor: 'pointer',
            }}
          >
            <TrashIcon />
          </button>
          <ChevronIcon open={expanded} />
        </div>
      </div>

      {/* Zone body */}
      {expanded && (
        <div style={{ padding: '16px 18px' }}>
          {/* Countries */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
              Країни
            </div>
            <CountryPicker
              selected={zone.countries}
              onChange={(countries) => onChange({ ...zone, countries })}
            />
          </div>

          {/* Methods table */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-base-500)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
            Методи доставки
          </div>

          {zone.methods.length > 0 ? (
            <div style={{ overflowX: 'auto', marginBottom: 12 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--color-base-50)', borderBottom: '1px solid var(--color-base-200)' }}>
                    {['ID методу', 'Перевізник', 'Назва', 'Ціна', 'Безк. від', 'Днів', 'Акт.', ''].map((h) => (
                      <th key={h} style={{
                        padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                        color: 'var(--color-base-400)', textTransform: 'uppercase', letterSpacing: '0.4px',
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zone.methods.map((method, mi) => (
                    <MethodRow
                      key={mi}
                      method={method}
                      index={mi}
                      onChange={(field, value) => updateMethod(mi, field, value)}
                      onRemove={() => removeMethod(mi)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', color: 'var(--color-base-400)', fontSize: 13, marginBottom: 12 }}>
              Немає методів доставки для цієї зони
            </div>
          )}

          <button
            type="button"
            onClick={addMethod}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
              borderRadius: 'var(--hl-radius-sm)', border: '1px dashed var(--color-sea-400)',
              background: 'rgba(91,196,196,0.04)', color: 'var(--color-sea-600)',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <PlusIcon /> Додати метод
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main View ────────────────────────────────────────────────────────

const ShippingConfigView: React.FC = () => {
  const [sender, setSender] = useState<NovaPoshtaSender>({})
  const [defaultWeight, setDefaultWeight] = useState(0.5)
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [npConfigured, setNpConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getShippingConfig()
      .then(({ config, npConfigured: npc }) => {
        const raw = config as unknown as Record<string, unknown>
        setSender((raw.novaPoshtaSender as NovaPoshtaSender) || {})
        setDefaultWeight((raw.defaultParcelWeight as number) || 0.5)
        setZones((raw.zones as ShippingZone[]) || [])
        setNpConfigured(npc)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await updateShippingConfig({
        novaPoshtaSender: sender,
        defaultParcelWeight: defaultWeight,
        zones,
      } as Parameters<typeof updateShippingConfig>[0])
      setSuccess('Налаштування збережено')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  const handleCitySelect = (city: CityOption) => {
    setSender((prev) => ({
      ...prev,
      cityRef: city.ref,
      cityName: city.area ? `${city.name} (${city.area})` : city.name,
      warehouseRef: '',
      warehouseName: '',
    }))
  }

  const handleWarehouseSelect = (wh: WarehouseOption) => {
    setSender((prev) => ({ ...prev, warehouseRef: wh.ref, warehouseName: wh.description }))
  }

  const updateZone = (i: number, updated: ShippingZone) =>
    setZones((prev) => prev.map((z, idx) => (idx === i ? updated : z)))
  const removeZone = (i: number) => setZones((prev) => prev.filter((_, idx) => idx !== i))
  const addZone = () => setZones((prev) => [...prev, emptyZone()])

  if (loading) {
    return (
      <div className="loyalty-admin" style={{ padding: '24px 32px', maxWidth: 1100 }}>
        <div className="loyalty-admin__loading">Завантаження...</div>
      </div>
    )
  }

  return (
    <div className="loyalty-admin" style={{ padding: '24px 32px', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div className="loyalty-admin__header" style={{ marginBottom: 0 }}>
          <h1>Налаштування доставки</h1>
          <p>Відправник, зони доставки та методи з тарифами</p>
        </div>
        <button
          className="loyalty-admin__btn loyalty-admin__btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Збереження...' : 'Зберегти'}
        </button>
      </div>

      {error && <div className="loyalty-admin__alert loyalty-admin__alert--error">{error}</div>}
      {success && <div className="loyalty-admin__alert loyalty-admin__alert--success">{success}</div>}

      {/* ── Section: Sender ─────────────────────────────────────── */}
      <div className="loyalty-admin__form-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPinIcon />
          Відправник (Нова Пошта)
          {!npConfigured && (
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
              background: 'rgba(230,184,156,0.1)', color: '#c4855a',
            }}>
              API ключ не налаштовано
            </span>
          )}
        </h2>

        <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2" style={{ marginBottom: 14 }}>
          <div className="loyalty-admin__field">
            <label>Місто відправника</label>
            {npConfigured ? (
              <AdminCitySearch value={sender.cityName || ''} onSelect={handleCitySelect} />
            ) : (
              <input
                type="text"
                value={sender.cityName || ''}
                onChange={(e) => setSender((p) => ({ ...p, cityName: e.target.value }))}
                placeholder="Введіть назву міста"
              />
            )}
            {sender.cityRef && (
              <div className="loyalty-admin__field-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#4a9468' }}><CheckIcon /></span>
                Ref: <code style={{ fontSize: 11, background: 'var(--color-base-100)', padding: '1px 5px', borderRadius: 3 }}>{sender.cityRef}</code>
              </div>
            )}
          </div>

          <div className="loyalty-admin__field">
            <label>Телефон відправника</label>
            <input
              type="text"
              value={sender.senderPhone || ''}
              onChange={(e) => setSender((p) => ({ ...p, senderPhone: e.target.value }))}
              placeholder="+380XXXXXXXXX"
            />
          </div>
        </div>

        <div className="loyalty-admin__field" style={{ marginBottom: 14 }}>
          <label>Відділення відправника</label>
          {npConfigured ? (
            <AdminWarehouseSearch
              cityRef={sender.cityRef || ''}
              value={sender.warehouseName || ''}
              onSelect={handleWarehouseSelect}
            />
          ) : (
            <input
              type="text"
              value={sender.warehouseName || ''}
              onChange={(e) => setSender((p) => ({ ...p, warehouseName: e.target.value }))}
              placeholder="Введіть назву відділення"
            />
          )}
          {sender.warehouseRef && (
            <div className="loyalty-admin__field-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: '#4a9468' }}><CheckIcon /></span>
              Ref: <code style={{ fontSize: 11, background: 'var(--color-base-100)', padding: '1px 5px', borderRadius: 3 }}>{sender.warehouseRef}</code>
            </div>
          )}
        </div>
      </div>

      {/* ── Section: Default Weight ──────────────────────────────── */}
      <div className="loyalty-admin__form-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PackageIcon />
          Загальні налаштування
        </h2>
        <div className="loyalty-admin__form-grid loyalty-admin__form-grid--2">
          <div className="loyalty-admin__field">
            <label>Вага за замовчуванням (кг)</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={defaultWeight}
              onChange={(e) => setDefaultWeight(parseFloat(e.target.value) || 0.5)}
            />
            <div className="loyalty-admin__field-hint">Якщо товар не має заданої ваги</div>
          </div>
        </div>
      </div>

      {/* ── Section: Zones ──────────────────────────────────────── */}
      <div className="loyalty-admin__form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <GlobeIcon />
            Зони доставки
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 12,
              background: 'rgba(91,196,196,0.1)', color: 'var(--color-sea-600)',
            }}>
              {zones.length}
            </span>
          </h2>
          <button
            type="button"
            className="loyalty-admin__btn loyalty-admin__btn--secondary"
            onClick={addZone}
            style={{ fontSize: 12, padding: '7px 14px' }}
          >
            <PlusIcon /> Додати зону
          </button>
        </div>

        {zones.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '28px 16px', color: 'var(--color-base-400)',
            fontSize: 13, border: '1px dashed var(--color-base-200)', borderRadius: 'var(--hl-radius-md)',
          }}>
            Немає зон доставки. Натисніть &ldquo;Додати зону&rdquo; щоб створити першу.
          </div>
        ) : (
          zones.map((zone, i) => (
            <ZoneCard
              key={i}
              zone={zone}
              index={i}
              onChange={(updated) => updateZone(i, updated)}
              onRemove={() => removeZone(i)}
            />
          ))
        )}
      </div>

      {/* Bottom Save */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="loyalty-admin__btn loyalty-admin__btn--primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Збереження...' : 'Зберегти налаштування'}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

export default ShippingConfigView
