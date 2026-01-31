"use client"

/**
 * Region Context for Medusa Multi-Region Support
 *
 * CRITICAL: Region determines currency, pricing, taxes, and product availability
 * - Required for creating carts (must pass region_id)
 * - Required for retrieving products with correct prices
 * - Required for filtering payment and shipping methods
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import type { StoreRegion } from "@medusajs/types"

interface RegionContextValue {
  region: StoreRegion | null
  regions: StoreRegion[]
  isLoading: boolean
  error: Error | null
  setRegion: (region: StoreRegion) => void
  setRegionByCountry: (countryCode: string) => void
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined)

const REGION_STORAGE_KEY = "medusa_region"

export function RegionProvider({ children }: { children: ReactNode }) {
  const [region, setRegionState] = useState<StoreRegion | null>(null)
  const [regions, setRegions] = useState<StoreRegion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load regions on mount
  useEffect(() => {
    loadRegions()
  }, [])

  async function loadRegions() {
    try {
      setIsLoading(true)
      
      // TODO: Query MCP server or docs for exact region listing method
      // Example (verify before use):
      // import { sdk } from "@/lib/medusa/client"
      // const { regions } = await sdk.store.region.list()
      
      // For now, set placeholder
      const fetchedRegions: StoreRegion[] = []
      
      setRegions(fetchedRegions)

      // Try to restore saved region from localStorage
      const savedRegionId = localStorage.getItem(REGION_STORAGE_KEY)
      if (savedRegionId) {
        const savedRegion = fetchedRegions.find((r) => r.id === savedRegionId)
        if (savedRegion) {
          setRegionState(savedRegion)
          setIsLoading(false)
          return
        }
      }

      // Auto-detect region by user's country (browser locale or IP)
      const userCountry = detectUserCountry()
      const detectedRegion = fetchedRegions.find((r) =>
        r.countries?.some((c) => c.iso_2?.toLowerCase() === userCountry.toLowerCase())
      )

      if (detectedRegion) {
        setRegion(detectedRegion)
      } else if (fetchedRegions.length > 0) {
        // Fallback to first region
        setRegion(fetchedRegions[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load regions"))
      console.error("Error loading regions:", err)
    } finally {
      setIsLoading(false)
    }
  }

  function setRegion(newRegion: StoreRegion) {
    setRegionState(newRegion)
    localStorage.setItem(REGION_STORAGE_KEY, newRegion.id)
  }

  function setRegionByCountry(countryCode: string) {
    const matchingRegion = regions.find((r) =>
      r.countries?.some((c) => c.iso_2?.toLowerCase() === countryCode.toLowerCase())
    )
    if (matchingRegion) {
      setRegion(matchingRegion)
    }
  }

  function detectUserCountry(): string {
    // Try to detect from browser locale
    const locale = navigator.language || (navigator as any).userLanguage
    const countryCode = locale.split("-")[1] || locale.split("_")[1]
    
    // Default to Ukraine for this store
    return countryCode?.toUpperCase() || "UA"
  }

  return (
    <RegionContext.Provider
      value={{
        region,
        regions,
        isLoading,
        error,
        setRegion,
        setRegionByCountry,
      }}
    >
      {children}
    </RegionContext.Provider>
  )
}

export function useRegion() {
  const context = useContext(RegionContext)
  if (context === undefined) {
    throw new Error("useRegion must be used within RegionProvider")
  }
  return context
}

/**
 * Hook to get current region ID (convenience)
 */
export function useRegionId() {
  const { region } = useRegion()
  return region?.id || null
}
