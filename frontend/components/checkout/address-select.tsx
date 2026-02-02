'use client'

import { MapPin, ChevronDown } from 'lucide-react'
import type { Address } from '@/lib/medusa/hooks/use-addresses'

interface AddressSelectProps {
  addresses: Address[]
  onSelect: (address: Address) => void
  selectedId?: string
}

export function AddressSelect({ addresses, onSelect, selectedId }: AddressSelectProps) {
  if (addresses.length === 0) return null

  return (
    <div className="mb-6">
      <label className="text-sm font-medium flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        Збережені адреси
      </label>
      <div className="relative">
        <select
          className="w-full h-11 px-4 pr-10 rounded-xl border border-input bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]"
          onChange={(e) => {
            const address = addresses.find((a) => a.id === e.target.value)
            if (address) onSelect(address)
          }}
          value={selectedId || ''}
        >
          <option value="">Оберіть збережену адресу</option>
          {addresses.map((address) => {
            const label = [
              address.city,
              address.address_1,
            ].filter(Boolean).join(', ')
            const isDefault = address.is_default_shipping

            return (
              <option key={address.id} value={address.id}>
                {label}
                {isDefault ? ' (основна)' : ''}
              </option>
            )
          })}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Або заповніть форму нижче вручну
      </p>
    </div>
  )
}
