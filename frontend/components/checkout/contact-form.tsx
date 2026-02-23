'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { contactSchema, flattenZodErrors } from '@/lib/validations/schemas'

interface ContactFormData {
  email: string
  phone: string
  firstName: string
  lastName: string
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void
  initialData?: Partial<ContactFormData>
}

export function ContactForm({ onSubmit, initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
  })

  const [errors, setErrors] = useState<Partial<ContactFormData>>({})

  // Update form when initialData changes (e.g., when customer data loads)
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        firstName: initialData.firstName || prev.firstName,
        lastName: initialData.lastName || prev.lastName,
      }))
    }
  }, [initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = () => {
    const result = contactSchema.safeParse(formData)
    if (result.success) {
      setErrors({})
      return true
    }
    setErrors(flattenZodErrors(result) as Partial<ContactFormData>)
    return false
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-contact-form">
      <h2 className="text-xl font-semibold">Контактна інформація</h2>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-destructive">*</span>
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-sm text-destructive" role="alert">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Телефон <span className="text-destructive">*</span>
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+380 XX XXX XXXX"
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && (
          <p className="text-sm text-destructive" role="alert">{errors.phone}</p>
        )}
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            Ім&apos;я <span className="text-destructive">*</span>
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ваше імʼя"
            className={errors.firstName ? 'border-destructive' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive" role="alert">{errors.firstName}</p>
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
            className={errors.lastName ? 'border-destructive' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive" role="alert">{errors.lastName}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full h-12 rounded-button">
        Продовжити
      </Button>
    </form>
  )
}
