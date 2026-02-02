'use client'

import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { AddressSelect } from './address-select'
import type { Address } from '@/lib/medusa/hooks/use-addresses'

interface ShippingFormData {
  city: string
  warehouse: string
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void
  onBack: () => void
  initialData?: Partial<ShippingFormData>
  isLoading?: boolean
  addresses?: Address[]
  isAuthenticated?: boolean
}

export function ShippingForm({
  onSubmit,
  onBack,
  initialData,
  isLoading,
  addresses = [],
  isAuthenticated = false,
}: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    city: initialData?.city || '',
    warehouse: initialData?.warehouse || '',
  })
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>()

  // Update form when initialData changes (e.g., from customer profile)
  useEffect(() => {
    if (initialData?.city || initialData?.warehouse) {
      setFormData({
        city: initialData.city || '',
        warehouse: initialData.warehouse || '',
      })
    }
  }, [initialData?.city, initialData?.warehouse])

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id)
    setFormData({
      city: address.city || '',
      warehouse: address.address_1 || '',
    })
  }

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof ShippingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof ShippingFormData, string>> = {}

    if (!formData.city) {
      newErrors.city = "Обов'язкове поле"
    }

    if (!formData.warehouse) {
      newErrors.warehouse = "Обов'язкове поле"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold">Спосіб доставки</h2>

      {/* Saved addresses selector */}
      {isAuthenticated && addresses.length > 0 && (
        <AddressSelect
          addresses={addresses}
          onSelect={handleAddressSelect}
          selectedId={selectedAddressId}
        />
      )}

      {/* Nova Poshta card */}
      <div
        className={cn(
          "flex items-center gap-4 p-4 rounded-card border-2 border-primary bg-primary/5"
        )}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary text-primary-foreground">
          <Package className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <span className="font-medium block">Нова Пошта</span>
          <span className="text-sm text-muted-foreground">
            Доставка 2-3 робочі дні, за тарифами перевізника
          </span>
        </div>
      </div>

      {/* City */}
      <div className="space-y-2">
        <label htmlFor="city" className="text-sm font-medium">
          Місто <span className="text-destructive">*</span>
        </label>
        <Input
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="Введіть назву міста"
          className={errors.city ? 'border-destructive' : ''}
          disabled={isLoading}
        />
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city}</p>
        )}
      </div>

      {/* Nova Poshta Warehouse */}
      <div className="space-y-2">
        <label htmlFor="warehouse" className="text-sm font-medium">
          Відділення / Поштомат <span className="text-destructive">*</span>
        </label>
        <Input
          id="warehouse"
          name="warehouse"
          value={formData.warehouse}
          onChange={handleChange}
          placeholder="Номер або адреса відділення"
          className={errors.warehouse ? 'border-destructive' : ''}
          disabled={isLoading}
        />
        {errors.warehouse && (
          <p className="text-sm text-destructive">{errors.warehouse}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Наприклад: Відділення №5, вул. Шевченка, 10
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
          disabled={isLoading}
        >
          Назад
        </Button>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-button"
          disabled={isLoading}
        >
          {isLoading ? 'Завантаження...' : 'Продовжити'}
        </Button>
      </div>
    </form>
  )
}
