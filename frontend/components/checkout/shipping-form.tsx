'use client'

import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { shippingSchema, flattenZodErrors } from '@/lib/validations/schemas'
import { AddressSelect } from './address-select'
import type { Address } from '@/lib/hooks/use-addresses'

interface ShippingOption {
  methodId: string
  name: string
  price: number
  freeAbove?: number
}

interface ShippingFormData {
  city: string
  warehouse: string
  shippingMethodId: string
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void
  onBack: () => void
  initialData?: Partial<ShippingFormData>
  isLoading?: boolean
  addresses?: Address[]
  isAuthenticated?: boolean
  shippingOptions?: ShippingOption[]
}

export function ShippingForm({
  onSubmit,
  onBack,
  initialData,
  isLoading,
  addresses = [],
  isAuthenticated = false,
  shippingOptions = [],
}: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    city: initialData?.city || '',
    warehouse: initialData?.warehouse || '',
    shippingMethodId: initialData?.shippingMethodId || (shippingOptions.length > 0 ? shippingOptions[0].methodId : ''),
  })
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>()
  const [autoFilled, setAutoFilled] = useState(false)

  // Set default shipping method when options load
  useEffect(() => {
    if (shippingOptions.length > 0 && !formData.shippingMethodId) {
      setFormData((prev) => ({ ...prev, shippingMethodId: shippingOptions[0].methodId }))
    }
  }, [shippingOptions, formData.shippingMethodId])

  // Auto-select default address on first load for authenticated users
  useEffect(() => {
    if (autoFilled || !isAuthenticated || addresses.length === 0) return

    const defaultAddr = addresses.find(a => a.isDefaultShipping) || addresses[0]
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id)
      setFormData((prev) => ({
        ...prev,
        city: defaultAddr.city || '',
        warehouse: defaultAddr.address1 || '',
      }))
      setAutoFilled(true)
    }
  }, [addresses, isAuthenticated, autoFilled])

  // Update form when initialData changes (e.g., from customer profile)
  useEffect(() => {
    if (initialData?.city || initialData?.warehouse) {
      setFormData((prev) => ({
        ...prev,
        city: initialData.city || '',
        warehouse: initialData.warehouse || '',
      }))
    }
  }, [initialData?.city, initialData?.warehouse])

  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id)
    setFormData((prev) => ({
      ...prev,
      city: address.city || '',
      warehouse: address.address1 || '',
    }))
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
    const dataToValidate = {
      ...formData,
      shippingMethodId: formData.shippingMethodId || (shippingOptions.length === 0 ? 'nova-poshta' : formData.shippingMethodId),
    }
    const result = shippingSchema.safeParse(dataToValidate)
    if (result.success) {
      setErrors({})
      return true
    }
    setErrors(flattenZodErrors(result) as Partial<Record<keyof ShippingFormData, string>>)
    return false
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-shipping-form">
      <h2 className="text-xl font-semibold">Спосіб доставки</h2>

      {/* Saved addresses selector */}
      {isAuthenticated && addresses.length > 0 && (
        <AddressSelect
          addresses={addresses}
          onSelect={handleAddressSelect}
          selectedId={selectedAddressId}
        />
      )}

      {/* Shipping method selection */}
      {shippingOptions.length > 0 ? (
        <div className="space-y-3">
          {shippingOptions.map((option) => {
            const isSelected = formData.shippingMethodId === option.methodId
            return (
              <button
                key={option.methodId}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, shippingMethodId: option.methodId }))
                }
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-4 w-full p-4 rounded-card border-2 transition-all text-left',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="font-medium block">{option.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.freeAbove
                      ? `Безкоштовно від ${option.freeAbove} ₴, інакше ${option.price} ₴`
                      : `${option.price} ₴`}
                  </span>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex-shrink-0',
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                  )}
                >
                  {isSelected && (
                    <span className="block w-full h-full bg-white rounded-full scale-50" />
                  )}
                </div>
              </button>
            )
          })}
          {errors.shippingMethodId && (
            <p className="text-sm text-destructive" role="alert">
              {errors.shippingMethodId}
            </p>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center gap-4 p-4 rounded-card border-2 border-primary bg-primary/5'
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
      )}

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
          <p className="text-sm text-destructive" role="alert">{errors.city}</p>
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
          <p className="text-sm text-destructive" role="alert">{errors.warehouse}</p>
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
