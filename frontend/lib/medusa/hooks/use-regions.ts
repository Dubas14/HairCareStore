import { useQuery } from "@tanstack/react-query"
import { sdk } from "../client"

export interface MedusaRegion {
  id: string
  name: string
  currency_code: string
  countries: Array<{
    id: string
    iso_2: string
    name: string
  }>
}

interface RegionsResponse {
  regions: MedusaRegion[]
  count: number
}

/**
 * Fetch all regions from Medusa
 */
export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async (): Promise<MedusaRegion[]> => {
      const response = await sdk.store.region.list()
      return (response as RegionsResponse).regions
    },
  })
}

/**
 * Get the default region (first available or Ukraine if exists)
 */
export function useDefaultRegion() {
  const { data: regions, ...rest } = useRegions()

  const defaultRegion = regions?.find(
    (r) => r.name.toLowerCase().includes("україна") || r.name.toLowerCase().includes("ukraine")
  ) || regions?.[0]

  return {
    data: defaultRegion,
    regions,
    ...rest,
  }
}
