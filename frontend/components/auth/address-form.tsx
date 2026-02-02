'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, MapPin, Phone, User } from 'lucide-react'
import type { Address, AddressInput } from '@/lib/medusa/hooks/use-addresses'

interface AddressFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: Address | null
  onSubmit: (data: AddressInput) => Promise<void>
  isLoading?: boolean
}

interface FormData {
  first_name: string
  last_name: string
  phone: string
  city: string
  address_1: string
  is_default_shipping: boolean
}

interface FormErrors {
  first_name?: string
  last_name?: string
  phone?: string
  city?: string
  address_1?: string
}

export function AddressForm({
  open,
  onOpenChange,
  address,
  onSubmit,
  isLoading,
}: AddressFormProps) {
  const isEditMode = !!address

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    address_1: '',
    is_default_shipping: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Populate form when editing
  useEffect(() => {
    if (address) {
      setFormData({
        first_name: address.first_name || '',
        last_name: address.last_name || '',
        phone: address.phone || '',
        city: address.city || '',
        address_1: address.address_1 || '',
        is_default_shipping: address.is_default_shipping || false,
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        phone: '',
        city: '',
        address_1: '',
        is_default_shipping: false,
      })
    }
    setErrors({})
  }, [address, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Обов'язкове поле"
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Обов'язкове поле"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Обов'язкове поле"
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Невірний формат номера'
    }

    if (!formData.city.trim()) {
      newErrors.city = "Обов'язкове поле"
    }

    if (!formData.address_1.trim()) {
      newErrors.address_1 = "Обов'язкове поле"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await onSubmit({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address_1: formData.address_1.trim(),
        is_default_shipping: formData.is_default_shipping,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save address:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditMode ? 'Редагувати адресу' : 'Додати нову адресу'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Ім&apos;я <span className="text-destructive">*</span>
              </label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Ваше ім'я"
                className={`h-11 rounded-xl ${
                  errors.first_name
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'focus-visible:ring-[#2A9D8F]'
                }`}
                disabled={isLoading}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium">
                Прізвище <span className="text-destructive">*</span>
              </label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Ваше прізвище"
                className={`h-11 rounded-xl ${
                  errors.last_name
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'focus-visible:ring-[#2A9D8F]'
                }`}
                disabled={isLoading}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Телефон <span className="text-destructive">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+380 XX XXX XXXX"
              className={`h-11 rounded-xl ${
                errors.phone
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'focus-visible:ring-[#2A9D8F]'
              }`}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Місто <span className="text-destructive">*</span>
            </label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Введіть назву міста"
              className={`h-11 rounded-xl ${
                errors.city
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'focus-visible:ring-[#2A9D8F]'
              }`}
              disabled={isLoading}
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          {/* Nova Poshta Warehouse */}
          <div className="space-y-2">
            <label htmlFor="address_1" className="text-sm font-medium">
              Відділення / Поштомат НП <span className="text-destructive">*</span>
            </label>
            <Input
              id="address_1"
              name="address_1"
              value={formData.address_1}
              onChange={handleChange}
              placeholder="Номер або адреса відділення"
              className={`h-11 rounded-xl ${
                errors.address_1
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'focus-visible:ring-[#2A9D8F]'
              }`}
              disabled={isLoading}
            />
            {errors.address_1 && (
              <p className="text-sm text-destructive">{errors.address_1}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Наприклад: Відділення №5, вул. Шевченка, 10
            </p>
          </div>

          {/* Default shipping checkbox */}
          <Checkbox
            id="is_default_shipping"
            checked={formData.is_default_shipping}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, is_default_shipping: e.target.checked }))
            }
            disabled={isLoading}
            label="Зробити основною адресою"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl"
              disabled={isLoading}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-[#2A9D8F] hover:bg-[#238B7E]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Збереження...
                </>
              ) : isEditMode ? (
                'Зберегти зміни'
              ) : (
                'Додати адресу'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
