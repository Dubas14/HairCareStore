'use server'

import { createLogger } from '@/lib/logger'
import type {
  NpApiResponse,
  NpCity,
  NpWarehouse,
  NpTrackingStatus,
  CityOption,
  WarehouseOption,
  ShippingRateResult,
  TrackingResult,
} from './nova-poshta-types'
import { NP_STATUS_MAP } from './nova-poshta-types'

const log = createLogger('nova-poshta')

const NP_API_URL = 'https://api.novaposhta.ua/v2.0/json/'

// ─── In-memory cache with TTL ───────────────────────────────────────

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// ─── Helpers ────────────────────────────────────────────────────────

export async function isNovaPoshtaConfigured(): Promise<boolean> {
  return !!process.env.NOVA_POSHTA_API_KEY
}

async function callNpApi<T>(
  model: string,
  method: string,
  props: Record<string, unknown> = {}
): Promise<NpApiResponse<T>> {
  const apiKey = process.env.NOVA_POSHTA_API_KEY
  if (!apiKey) {
    return { success: false, data: [], errors: ['API key not configured'], warnings: [], info: { totalCount: 0 } }
  }

  try {
    const response = await fetch(NP_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        modelName: model,
        calledMethod: method,
        methodProperties: props,
      }),
    })

    if (!response.ok) {
      log.error(`NP API HTTP error: ${response.status}`)
      return { success: false, data: [], errors: [`HTTP ${response.status}`], warnings: [], info: { totalCount: 0 } }
    }

    const result = (await response.json()) as NpApiResponse<T>

    if (!result.success && result.errors.length > 0) {
      log.warn('NP API returned errors', result.errors)
    }

    return result
  } catch (err) {
    log.error('NP API call failed', err)
    return { success: false, data: [], errors: ['Network error'], warnings: [], info: { totalCount: 0 } }
  }
}

// ─── Public API ─────────────────────────────────────────────────────

const CACHE_CITIES_TTL = 24 * 60 * 60 * 1000 // 24h
const CACHE_WAREHOUSES_TTL = 60 * 60 * 1000   // 1h
const CACHE_RATE_TTL = 5 * 60 * 1000          // 5min

/**
 * Search cities by name (min 2 chars).
 */
export async function searchCities(query: string): Promise<CityOption[]> {
  if (!query || query.length < 2) return []

  const cacheKey = `cities:${query.toLowerCase()}`
  const cached = getCached<CityOption[]>(cacheKey)
  if (cached) return cached

  const result = await callNpApi<NpCity>('Address', 'searchSettlements', {
    CityName: query,
    Limit: '20',
    Page: '1',
  })

  if (!result.success || !result.data.length) {
    // Try getCities as fallback
    const fallback = await callNpApi<NpCity>('Address', 'getCities', {
      FindByString: query,
      Limit: '20',
      Page: '1',
    })

    if (!fallback.success) return []

    const cities = fallback.data.map((c) => ({
      ref: c.Ref,
      name: c.Description,
      area: c.AreaDescription || '',
      settlementType: c.SettlementTypeDescription || '',
    }))

    setCache(cacheKey, cities, CACHE_CITIES_TTL)
    return cities
  }

  // searchSettlements returns a nested structure
  const settlements = (result.data as unknown as Array<{ Addresses: NpCity[] }>)
  const cities: CityOption[] = []

  for (const group of settlements) {
    if (Array.isArray(group.Addresses)) {
      for (const addr of group.Addresses) {
        cities.push({
          ref: addr.Ref,
          name: addr.Description || (addr as unknown as Record<string, string>).MainDescription || '',
          area: addr.AreaDescription || (addr as unknown as Record<string, string>).Area || '',
          settlementType: addr.SettlementTypeDescription || (addr as unknown as Record<string, string>).SettlementTypeCode || '',
        })
      }
    }
  }

  setCache(cacheKey, cities, CACHE_CITIES_TTL)
  return cities
}

/**
 * Get warehouses for a city. Optional search filter.
 */
export async function getWarehouses(
  cityRef: string,
  search?: string
): Promise<WarehouseOption[]> {
  if (!cityRef) return []

  const cacheKey = `warehouses:${cityRef}:${search || ''}`
  const cached = getCached<WarehouseOption[]>(cacheKey)
  if (cached) return cached

  const props: Record<string, unknown> = {
    CityRef: cityRef,
    Limit: '50',
    Page: '1',
  }
  if (search) {
    props.FindByString = search
  }

  const result = await callNpApi<NpWarehouse>('Address', 'getWarehouses', props)

  if (!result.success) return []

  const warehouses: WarehouseOption[] = result.data.map((w) => ({
    ref: w.Ref,
    description: w.Description,
    number: w.Number,
    shortAddress: w.ShortAddress,
    category: w.CategoryOfWarehouse === 'Postomat' ? 'postomat' as const : 'branch' as const,
    maxWeight: w.PlaceMaxWeightAllowed || 30,
    postalCode: w.PostalCodeUA || '',
  }))

  setCache(cacheKey, warehouses, CACHE_WAREHOUSES_TTL)
  return warehouses
}

/**
 * Calculate shipping rate between two cities.
 */
export async function calculateShippingRate(params: {
  senderCityRef: string
  recipientCityRef: string
  weight?: number
  declaredValue?: number
}): Promise<ShippingRateResult | null> {
  if (!params.senderCityRef || !params.recipientCityRef) return null

  const weight = params.weight || 0.5
  const declaredValue = params.declaredValue || 300

  const cacheKey = `rate:${params.senderCityRef}:${params.recipientCityRef}:${weight}:${declaredValue}`
  const cached = getCached<ShippingRateResult>(cacheKey)
  if (cached) return cached

  const result = await callNpApi<{
    Cost: number
    EstimatedDeliveryDate: string
    CostRedelivery: number
  }>('InternetDocument', 'getDocumentPrice', {
    CitySender: params.senderCityRef,
    CityRecipient: params.recipientCityRef,
    Weight: String(weight),
    ServiceType: 'WarehouseWarehouse',
    Cost: String(declaredValue),
    CargoType: 'Parcel',
    SeatsAmount: '1',
  })

  if (!result.success || !result.data.length) return null

  const rate: ShippingRateResult = {
    cost: result.data[0].Cost,
    estimatedDeliveryDate: result.data[0].EstimatedDeliveryDate || '',
    codFee: result.data[0].CostRedelivery || 0,
  }

  setCache(cacheKey, rate, CACHE_RATE_TTL)
  return rate
}

/**
 * Track a shipment by TTN.
 */
export async function trackShipment(ttn: string): Promise<TrackingResult | null> {
  if (!ttn) return null

  const result = await callNpApi<NpTrackingStatus>('TrackingDocument', 'getStatusDocuments', {
    Documents: [{ DocumentNumber: ttn, Phone: '' }],
  })

  if (!result.success || !result.data.length) return null

  const doc = result.data[0]
  const statusInfo = NP_STATUS_MAP[doc.StatusCode] || { label: doc.Status, step: 0 }

  return {
    ttn: doc.Number,
    statusCode: doc.StatusCode,
    status: doc.Status,
    senderCity: doc.CitySender || '',
    recipientCity: doc.CityRecipient || '',
    senderWarehouse: doc.WarehouseSender || '',
    recipientWarehouse: doc.WarehouseRecipient || '',
    dateCreated: doc.DateCreated || '',
    dateScan: doc.DateScan || '',
    scheduledDeliveryDate: doc.ScheduledDeliveryDate || '',
    actualDeliveryDate: doc.ActualDeliveryDate || '',
    step: statusInfo.step,
    stepLabel: statusInfo.label,
  }
}
