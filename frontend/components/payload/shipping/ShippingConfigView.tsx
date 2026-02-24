'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  getShippingConfig,
  updateShippingConfig,
  adminSearchCities,
  adminGetWarehouses,
  type ShippingMethod,
  type NovaPoshtaSender,
} from '@/app/actions/shipping'
import type { CityOption, WarehouseOption } from '@/lib/shipping/nova-poshta-types'
import '../site-pages/site-pages.scss'

// ─── SVG Icons ──────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const PackageIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)
const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><line x1="8" y1="6" x2="8" y2="6" /><line x1="16" y1="6" x2="16" y2="6" /><line x1="12" y1="6" x2="12" y2="6" /><line x1="8" y1="10" x2="8" y2="10" /><line x1="16" y1="10" x2="16" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="8" y1="14" x2="8" y2="14" /><line x1="16" y1="14" x2="16" y2="14" /><line x1="12" y1="14" x2="12" y2="14" />
  </svg>
)

const emptyMethod: ShippingMethod = {
  methodId: '',
  name: '',
  price: 0,
  freeAbove: null,
  isActive: true,
}

// ─── City Search Combobox ───────────────────────────────────────────

function AdminCitySearch({
  value,
  onSelect,
  disabled,
}: {
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
    else if (e.key === 'Escape') { setIsOpen(false) }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current) } }, [])

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
          {isLoading ? <span className="sp-admin__spinner" /> : <SearchIcon />}
        </span>
      </div>
      {isOpen && options.length > 0 && (
        <div className="sp-admin__dropdown">
          {options.map((city, i) => (
            <div
              key={city.ref}
              className={`sp-admin__dropdown-item${highlightIndex === i ? ' sp-admin__dropdown-item--active' : ''}`}
              onClick={() => handleSelect(city)}
              onMouseEnter={() => setHighlightIndex(i)}
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

// ─── Warehouse Search Combobox ──────────────────────────────────────

function AdminWarehouseSearch({
  cityRef,
  value,
  onSelect,
  disabled,
}: {
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

  // Auto-load when cityRef appears
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
    else if (e.key === 'Escape') { setIsOpen(false) }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { return () => { if (debounceRef.current) clearTimeout(debounceRef.current) } }, [])

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
          {isLoading ? <span className="sp-admin__spinner" /> : <BuildingIcon />}
        </span>
      </div>
      {isOpen && options.length > 0 && (
        <div className="sp-admin__dropdown">
          {options.map((wh, i) => (
            <div
              key={wh.ref}
              className={`sp-admin__dropdown-item${highlightIndex === i ? ' sp-admin__dropdown-item--active' : ''}`}
              onClick={() => handleSelect(wh)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <span style={{ fontWeight: 500, fontSize: 13 }}>{wh.description}</span>
              <span style={{ display: 'block', color: 'var(--color-base-400)', fontSize: 11, marginTop: 1 }}>{wh.shortAddress}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main View ──────────────────────────────────────────────────────

const ShippingConfigView: React.FC = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([])
  const [sender, setSender] = useState<NovaPoshtaSender>({})
  const [defaultWeight, setDefaultWeight] = useState(0.5)
  const [npConfigured, setNpConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    getShippingConfig()
      .then(({ config, npConfigured: npc }) => {
        setMethods(config?.methods || [])
        setSender(config?.novaPoshtaSender || {})
        setDefaultWeight(config?.defaultParcelWeight || 0.5)
        setNpConfigured(npc)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const { config } = await updateShippingConfig({
        novaPoshtaSender: sender,
        defaultParcelWeight: defaultWeight,
        methods,
      })
      setMethods(config.methods || [])
      setSender(config.novaPoshtaSender || {})
      setDefaultWeight(config.defaultParcelWeight || 0.5)
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
    setSender((prev) => ({
      ...prev,
      warehouseRef: wh.ref,
      warehouseName: wh.description,
    }))
  }

  const updateMethod = (i: number, field: string, value: unknown) =>
    setMethods((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)))
  const addMethod = () => setMethods((prev) => [...prev, { ...emptyMethod }])
  const removeMethod = (i: number) => setMethods((prev) => prev.filter((_, idx) => idx !== i))

  if (loading) {
    return (
      <div className="sp" style={{ padding: '24px 32px', maxWidth: 1400 }}>
        <div className="sp-admin"><div className="sp-admin__loading">Завантаження...</div></div>
      </div>
    )
  }

  return (
    <div className="sp" style={{ padding: '24px 32px', maxWidth: 1400, animation: 'spFadeIn 0.4s ease-out' }}>
      <div className="sp-admin" style={{ maxWidth: 960 }}>
        {/* Header */}
        <div className="sp-admin__header">
          <h1>Конфігурація доставки</h1>
          <p>Нова Пошта API, відправник, способи доставки та тарифи</p>
        </div>

        {error && <div className="sp-admin__alert sp-admin__alert--error">{error}</div>}
        {success && <div className="sp-admin__alert sp-admin__alert--success">{success}</div>}

        {/* ── Section: API Status ─────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TruckIcon />
            Nova Poshta API
          </h2>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            borderRadius: 'var(--hl-radius-md)',
            background: npConfigured ? 'rgba(134, 199, 166, 0.08)' : 'rgba(230, 184, 156, 0.08)',
            border: `1px solid ${npConfigured ? 'rgba(134, 199, 166, 0.2)' : 'rgba(230, 184, 156, 0.2)'}`,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: '50%',
              background: npConfigured ? 'rgba(134, 199, 166, 0.2)' : 'rgba(230, 184, 156, 0.2)',
              color: npConfigured ? '#4a9468' : '#c4855a',
            }}>
              {npConfigured ? <CheckIcon /> : <XIcon />}
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: npConfigured ? '#4a9468' : '#c4855a' }}>
                {npConfigured ? 'API ключ підключено' : 'API ключ не налаштовано'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-base-400)', marginTop: 1 }}>
                {npConfigured
                  ? 'Автокомпліт міст, відділень та розрахунок тарифів працюють'
                  : 'Додайте NOVA_POSHTA_API_KEY до .env.local для активації'}
              </div>
            </div>
          </div>
        </div>

        {/* ── Section: Sender ─────────────────────────────────────── */}
        <div className="sp-admin__section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPinIcon />
            Відправник
          </h2>
          <p style={{ fontSize: 12, color: 'var(--color-base-400)', margin: '-8px 0 16px' }}>
            Місто та відділення відправника для розрахунку тарифів
          </p>

          <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 14 }}>
            <div className="sp-admin__field">
              <label>Місто відправника</label>
              {npConfigured ? (
                <AdminCitySearch
                  value={sender.cityName || ''}
                  onSelect={handleCitySelect}
                />
              ) : (
                <input
                  type="text"
                  value={sender.cityName || ''}
                  onChange={(e) => setSender((p) => ({ ...p, cityName: e.target.value }))}
                  placeholder="Введіть назву міста"
                />
              )}
              {sender.cityRef && (
                <div className="sp-admin__field-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#4a9468' }}><CheckIcon /></span>
                  Ref: <code style={{ fontSize: 11, background: 'var(--color-base-100)', padding: '1px 5px', borderRadius: 3 }}>{sender.cityRef}</code>
                </div>
              )}
            </div>
            <div className="sp-admin__field">
              <label>Телефон відправника</label>
              <input
                type="text"
                value={sender.senderPhone || ''}
                onChange={(e) => setSender((p) => ({ ...p, senderPhone: e.target.value }))}
                placeholder="+380XXXXXXXXX"
              />
            </div>
          </div>

          <div className="sp-admin__field">
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
              <div className="sp-admin__field-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#4a9468' }}><CheckIcon /></span>
                Ref: <code style={{ fontSize: 11, background: 'var(--color-base-100)', padding: '1px 5px', borderRadius: 3 }}>{sender.warehouseRef}</code>
              </div>
            )}
          </div>
        </div>

        {/* ── Section: General Settings ───────────────────────────── */}
        <div className="sp-admin__section">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <PackageIcon />
            Загальні налаштування
          </h2>

          <div className="sp-admin__grid sp-admin__grid--2">
            <div className="sp-admin__field">
              <label>Вага за замовчуванням (кг)</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={defaultWeight}
                onChange={(e) => setDefaultWeight(parseFloat(e.target.value) || 0.5)}
              />
              <div className="sp-admin__field-hint">Використовується для розрахунку тарифу, якщо товар не має ваги</div>
            </div>
          </div>
        </div>

        {/* ── Section: Shipping Methods ───────────────────────────── */}
        <div className="sp-admin__section">
          <div className="sp-admin__array-header">
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <TruckIcon />
              Способи доставки
              <span style={{
                fontSize: 12, fontWeight: 600,
                padding: '2px 10px', borderRadius: 12,
                background: 'rgba(91, 196, 196, 0.1)',
                color: 'var(--color-sea-600)',
              }}>
                {methods.length}
              </span>
            </h2>
          </div>

          {methods.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--color-base-400)', fontSize: 13 }}>
              Немає способів доставки. Додайте перший.
            </div>
          )}

          {methods.map((m, i) => (
            <div key={i} className="sp-admin__array-item">
              <div className="sp-admin__array-item-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-base-500)' }}>#{i + 1}</span>
                  <span
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500,
                      background: m.isActive ? 'rgba(134, 199, 166, 0.15)' : 'rgba(212, 165, 165, 0.15)',
                      color: m.isActive ? '#4a9468' : '#b06060',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                    {m.isActive ? 'Активний' : 'Неактивний'}
                  </span>
                  {m.name && (
                    <span style={{ fontWeight: 600, color: 'var(--color-base-700)' }}>{m.name}</span>
                  )}
                </span>
                <button type="button" className="sp-admin__remove-btn" onClick={() => removeMethod(i)} title="Видалити">
                  <TrashIcon />
                </button>
              </div>

              <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 10 }}>
                <div className="sp-admin__field">
                  <label>ID способу</label>
                  <input
                    type="text"
                    value={m.methodId}
                    onChange={(e) => updateMethod(i, 'methodId', e.target.value)}
                    placeholder="nova-poshta"
                  />
                  <div className="sp-admin__field-hint">Унікальний ідентифікатор</div>
                </div>
                <div className="sp-admin__field">
                  <label>Назва</label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMethod(i, 'name', e.target.value)}
                    placeholder="Нова Пошта"
                  />
                </div>
              </div>

              <div className="sp-admin__grid sp-admin__grid--2" style={{ marginBottom: 10 }}>
                <div className="sp-admin__field">
                  <label>Ціна (грн)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={m.price}
                    onChange={(e) => updateMethod(i, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="sp-admin__field">
                  <label>Безкоштовно від (грн)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={m.freeAbove ?? ''}
                    onChange={(e) => updateMethod(i, 'freeAbove', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="1500"
                  />
                  <div className="sp-admin__field-hint">Залиште порожнім, якщо немає порогу</div>
                </div>
              </div>

              <label className="sp-admin__checkbox">
                <input
                  type="checkbox"
                  checked={m.isActive}
                  onChange={(e) => updateMethod(i, 'isActive', e.target.checked)}
                />
                <span>Активний</span>
              </label>
            </div>
          ))}

          <button type="button" className="sp-admin__add-btn" onClick={addMethod}>
            <PlusIcon /> Додати спосіб доставки
          </button>
        </div>

        {/* ── Save Button ────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button className="sp-admin__btn sp-admin__btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Збереження...' : 'Зберегти налаштування'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShippingConfigView
