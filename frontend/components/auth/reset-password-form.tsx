'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useResetPassword } from '@/lib/medusa/hooks/use-password'
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

interface FormData {
  password: string
  confirmPassword: string
}

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetPassword = useResetPassword()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Redirect if no token or email
  const isValidLink = Boolean(token && email)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.password) {
      newErrors.password = "Обов'язкове поле"
    } else if (formData.password.length < 8) {
      newErrors.password = 'Мінімум 8 символів'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Обов'язкове поле"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !token || !email) return

    setIsLoading(true)
    setErrors({})

    try {
      await resetPassword.mutateAsync({
        token,
        email,
        password: formData.password,
      })
      setIsSuccess(true)
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Не вдалося змінити пароль. Посилання може бути недійсним або застарілим.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidLink) {
    return (
      <div className="text-center space-y-6 animate-fadeInUp">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Недійсне посилання</h2>
          <p className="text-muted-foreground">
            Посилання для відновлення пароля недійсне або застаріло.
            Спробуйте запросити нове посилання.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/account/forgot-password"
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#3AA99B] hover:from-[#238B7E] hover:to-[#2A9D8F] text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Запросити нове посилання
          </Link>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-fadeInUp">
        <div className="w-16 h-16 rounded-full bg-[#2A9D8F]/10 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-[#2A9D8F]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Пароль змінено</h2>
          <p className="text-muted-foreground">
            Ваш пароль успішно змінено. Тепер ви можете увійти з новим паролем.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/account/login"
            className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#3AA99B] hover:from-[#238B7E] hover:to-[#2A9D8F] text-white font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Увійти в акаунт
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

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Новий пароль
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Мінімум 8 символів"
            className={`h-12 rounded-xl pl-4 pr-12 transition-all ${
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#2A9D8F]'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Підтвердіть пароль
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторіть пароль"
            className={`h-12 rounded-xl pl-4 pr-12 transition-all ${
              errors.confirmPassword
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[#2A9D8F]'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.confirmPassword}</p>
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
            Зберігаємо...
          </>
        ) : (
          'Зберегти новий пароль'
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
