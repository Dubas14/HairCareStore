'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRequestPasswordReset } from '@/lib/hooks/use-password'
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react'

interface FormErrors {
  email?: string
  general?: string
}

export function ForgotPasswordForm() {
  const requestReset = useRequestPasswordReset()

  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = "Обов'язкове поле"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Невірний формат email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      await requestReset.mutateAsync(email)
      setIsSuccess(true)
    } catch (error) {
      // Don't reveal if email exists - show success message anyway for security
      setIsSuccess(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-fadeInUp">
        <div className="w-16 h-16 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-[#2A9D8F]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Перевірте пошту</h2>
          <p className="text-muted-foreground">
            Якщо акаунт з адресою <span className="font-medium text-foreground">{email}</span> існує,
            ви отримаєте лист з інструкціями для відновлення пароля.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 text-[#2A9D8F] hover:text-[#238B7E] font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Повернутися до входу
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General error */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fadeInScale">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email
        </label>
        <div className="relative">
          <Input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
            }}
            placeholder="your@email.com"
            className={`h-12 rounded-xl pl-4 pr-4 transition-all ${
              errors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#2A9D8F]'
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.email}</p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#3AA99B] hover:from-[#238B7E] hover:to-[#2A9D8F] text-white font-medium shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Надсилаємо...
          </>
        ) : (
          'Відновити пароль'
        )}
      </Button>

      {/* Back to login */}
      <div className="text-center pt-4">
        <Link
          href="/account/login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Повернутися до входу
        </Link>
      </div>
    </form>
  )
}
