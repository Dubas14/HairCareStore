'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRegister } from '@/lib/hooks/use-customer'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check } from 'lucide-react'
import { registerSchema, flattenZodErrors } from '@/lib/validations/schemas'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z\d]/.test(password)) score++
    return score
  }

  const strength = getStrength()
  const labels = ['Слабкий', 'Середній', 'Добрий', 'Сильний']
  const colors = ['bg-destructive', 'bg-sale', 'bg-[#48CAE4]', 'bg-success']

  if (!password) return null

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength - 1] : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength >= 3 ? 'text-success' : 'text-muted-foreground'}`}>
        Надійність: {labels[strength - 1] || 'Дуже слабкий'}
      </p>
    </div>
  )
}

export function RegisterForm() {
  const router = useRouter()
  const register = useRegister()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const result = registerSchema.safeParse({ ...formData, acceptTerms })
    if (result.success) {
      setErrors({})
      return true
    }
    const flat = flattenZodErrors(result)
    setErrors({
      firstName: flat.firstName,
      lastName: flat.lastName,
      email: flat.email,
      password: flat.password,
      confirmPassword: flat.confirmPassword,
      general: flat.acceptTerms,
    })
    return false
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      })

      // Show success message before redirect
      setIsSuccess(true)
      setIsLoading(false)
      setTimeout(() => {
        router.push('/account')
      }, 1500)
    } catch (error) {
      setIsLoading(false)
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'Помилка реєстрації. Можливо, цей email вже зареєстрований.',
      })
    }
  }

  // Show success screen
  if (isSuccess) {
    return (
      <div className="text-center py-8 animate-fadeInScale">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Реєстрація успішна!</h3>
        <p className="text-muted-foreground mb-4">
          Ласкаво просимо до Hair Lab, {formData.firstName}!
        </p>
        <p className="text-sm text-muted-foreground">
          Переадресація до особистого кабінету...
        </p>
        <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4 text-[hsl(var(--brand-teal))]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
      {/* General error */}
      {errors.general && (
        <div role="alert" className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fadeInScale">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      {/* Name fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Ім&apos;я
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Ваше ім'я"
            className={`h-12 rounded-xl transition-all ${
              errors.firstName
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[hsl(var(--brand-teal))]'
            }`}
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive animate-fadeInUp">{errors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Прізвище
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Ваше прізвище"
            className={`h-12 rounded-xl transition-all ${
              errors.lastName
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[hsl(var(--brand-teal))]'
            }`}
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive animate-fadeInUp">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className={`h-12 rounded-xl transition-all ${
            errors.email
              ? 'border-destructive focus-visible:ring-destructive'
              : 'focus-visible:ring-[hsl(var(--brand-teal))]'
          }`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          Пароль
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            placeholder="Мінімум 8 символів"
            className={`h-12 rounded-xl pr-12 transition-all ${
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : 'focus-visible:ring-[hsl(var(--brand-teal))]'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Показати/сховати пароль"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.password}</p>
        )}
        <PasswordStrength password={formData.password} />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Підтвердження пароля
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторіть пароль"
            className={`h-12 rounded-xl pr-12 transition-all ${
              errors.confirmPassword
                ? 'border-destructive focus-visible:ring-destructive'
                : formData.confirmPassword && formData.password === formData.confirmPassword
                ? 'border-success focus-visible:ring-success'
                : 'focus-visible:ring-[hsl(var(--brand-teal))]'
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Показати/сховати пароль підтвердження"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <Check className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
          )}
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive animate-fadeInUp">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms checkbox */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="peer sr-only"
          />
          <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-[hsl(var(--brand-teal))] peer-checked:bg-[hsl(var(--brand-teal))] transition-colors flex items-center justify-center">
            {acceptTerms && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          Я погоджуюсь з{' '}
          <Link href="/pages/terms" className="text-[hsl(var(--brand-teal))] hover:underline">
            умовами використання
          </Link>{' '}
          та{' '}
          <Link href="/pages/privacy" className="text-[hsl(var(--brand-teal))] hover:underline">
            політикою конфіденційності
          </Link>
        </span>
      </label>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-full bg-gradient-to-r from-[hsl(var(--brand-teal))] to-[hsl(var(--brand-teal-light))] hover:from-[hsl(var(--brand-teal-dark))] hover:to-[hsl(var(--brand-teal))] text-white font-medium shadow-lg hover:shadow-xl transition-all mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Реєстрація...
          </>
        ) : (
          'Створити акаунт'
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-sm text-muted-foreground">або</span>
        </div>
      </div>

      {/* Google registration */}
      <button
        type="button"
        onClick={() => { window.location.href = '/api/auth/google' }}
        className="w-full h-12 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center gap-3 font-medium transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Зареєструватися через Google
      </button>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Вже маєте акаунт?{' '}
        <Link
          href="/account/login"
          className="font-medium text-[hsl(var(--brand-teal))] hover:text-[hsl(var(--brand-teal-dark))] transition-colors"
        >
          Увійти
        </Link>
      </p>
    </form>
  )
}
