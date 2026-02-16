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
import type { Address, AddressInput } from '@/lib/hooks/use-addresses'

interface AddressFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address?: Address | null
  onSubmit: (data: AddressInput) => Promise<void>
  isLoading?: boolean
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  city: string
  address1: string
  isDefaultShipping: boolean
}

interface FormErrors {
  firstName?: string
  lastName?: string
  phone?: string
  city?: string
  address1?: string
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
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address1: '',
    isDefaultShipping: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Populate form when editing
  useEffect(() => {
    if (address) {
      setFormData({
        firstName: address.firstName || '',
        lastName: address.lastName || '',
        phone: address.phone || '',
        city: address.city || '',
        address1: address.address1 || '',
        isDefaultShipping: address.isDefaultShipping || false,
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        address1: '',
        isDefaultShipping: false,
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Обов'язкове поле"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Обов'язкове поле"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Обов'язкове поле"
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Невірний формат номера'
    }

    if (!formData.city.trim()) {
      newErrors.city = "Обов'язкове поле"
    }

    if (!formData.address1.trim()) {
      newErrors.address1 = "Обов'язкове поле"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    try {
      await onSubmit({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        address1: formData.address1.trim(),
        isDefaultShipping: formData.isDefaultShipping,
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
              <label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Ім&apos;я <span className="text-destructive">*</span>
              </label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ваше ім'я"
                className={`h-11 rounded-xl ${
                  errors.firstName
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'focus-visible:ring-[#2A9D8F]'
                }`}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium">
                Прізвище <span className="text-destructive">*</span>
              </label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Ваше прізвище"
                className={`h-11 rounded-xl ${
                  errors.lastName
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'focus-visible:ring-[#2A9D8F]'
                }`}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
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
            <label htmlFor="address1" className="text-sm font-medium">
              Відділення / Поштомат НП <span className="text-destructive">*</span>
            </label>
            <Input
              id="address1"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              placeholder="Номер або адреса відділення"
              className={`h-11 rounded-xl ${
                errors.address1
                  ? 'border-destructive focus-visible:ring-destructive'
                  : 'focus-visible:ring-[#2A9D8F]'
              }`}
              disabled={isLoading}
            />
            {errors.address1 && (
              <p className="text-sm text-destructive">{errors.address1}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Наприклад: Відділення №5, вул. Шевченка, 10
            </p>
          </div>

          {/* Default shipping checkbox */}
          <Checkbox
            id="isDefaultShipping"
            checked={formData.isDefaultShipping}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isDefaultShipping: e.target.checked }))
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
