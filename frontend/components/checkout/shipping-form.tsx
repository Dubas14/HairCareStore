'use client'

import { useState } from 'react'
import { Truck, Package, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DeliveryMethod = 'courier' | 'nova-poshta' | 'pickup'

interface ShippingFormData {
  method: DeliveryMethod
  city: string
  address: string
  warehouse?: string
}

interface ShippingFormProps {
  onSubmit: (data: ShippingFormData) => void
  onBack: () => void
  initialData?: Partial<ShippingFormData>
}

const deliveryMethods = [
  {
    id: 'courier' as const,
    name: "Кур'єр",
    description: '1-2 робочі дні',
    price: '80 ₴',
    icon: Truck,
  },
  {
    id: 'nova-poshta' as const,
    name: 'Нова Пошта',
    description: '2-3 робочі дні',
    price: 'за тарифами',
    icon: Package,
  },
  {
    id: 'pickup' as const,
    name: 'Самовивіз',
    description: 'Сьогодні',
    price: 'Безкоштовно',
    icon: MapPin,
  },
]

export function ShippingForm({ onSubmit, onBack, initialData }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    method: initialData?.method || 'nova-poshta',
    city: initialData?.city || '',
    address: initialData?.address || '',
    warehouse: initialData?.warehouse || '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof ShippingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleMethodChange = (method: DeliveryMethod) => {
    setFormData((prev) => ({ ...prev, method }))
  }

  const validate = () => {
    const newErrors: Partial<Record<keyof ShippingFormData, string>> = {}

    if (!formData.city) {
      newErrors.city = "Обов'язкове поле"
    }

    if (formData.method === 'courier' && !formData.address) {
      newErrors.address = "Обов'язкове поле"
    }

    if (formData.method === 'nova-poshta' && !formData.warehouse) {
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

      {/* Delivery Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {deliveryMethods.map((method) => {
          const Icon = method.icon
          const isSelected = formData.method === method.id

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => handleMethodChange(method.id)}
              className={cn(
                "flex flex-col items-center p-4 rounded-card border-2 transition-all text-center",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Icon className={cn("w-8 h-8 mb-2", isSelected ? "text-primary" : "text-muted-foreground")} />
              <span className="font-medium">{method.name}</span>
              <span className="text-xs text-muted-foreground">{method.description}</span>
              <span className="text-sm font-semibold mt-1">{method.price}</span>
            </button>
          )
        })}
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
          placeholder="Введіть місто"
          className={errors.city ? 'border-destructive' : ''}
        />
        {errors.city && (
          <p className="text-sm text-destructive">{errors.city}</p>
        )}
      </div>

      {/* Courier Address */}
      {formData.method === 'courier' && (
        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Адреса <span className="text-destructive">*</span>
          </label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Вулиця, будинок, квартира"
            className={errors.address ? 'border-destructive' : ''}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>
      )}

      {/* Nova Poshta Warehouse */}
      {formData.method === 'nova-poshta' && (
        <div className="space-y-2">
          <label htmlFor="warehouse" className="text-sm font-medium">
            Відділення Нової Пошти <span className="text-destructive">*</span>
          </label>
          <Input
            id="warehouse"
            name="warehouse"
            value={formData.warehouse}
            onChange={handleChange}
            placeholder="Номер або адреса відділення"
            className={errors.warehouse ? 'border-destructive' : ''}
          />
          {errors.warehouse && (
            <p className="text-sm text-destructive">{errors.warehouse}</p>
          )}
        </div>
      )}

      {/* Pickup Info */}
      {formData.method === 'pickup' && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="font-medium">Адреса самовивозу:</p>
          <p className="text-muted-foreground">м. Київ, вул. Хрещатик, 1</p>
          <p className="text-muted-foreground text-sm mt-2">
            Пн-Пт: 10:00 - 20:00, Сб-Нд: 11:00 - 18:00
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-12">
          Назад
        </Button>
        <Button type="submit" className="flex-1 h-12 rounded-button">
          Продовжити
        </Button>
      </div>
    </form>
  )
}
