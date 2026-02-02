'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRegister } from '@/lib/medusa/hooks/use-customer'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check } from 'lucide-react'

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
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Обов'язкове поле"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Обов'язкове поле"
    }

    if (!formData.email) {
      newErrors.email = "Обов'язкове поле"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Невірний формат email'
    }

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

    if (!acceptTerms) {
      newErrors.general = 'Прийміть умови використання'
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
      await register.mutateAsync({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
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
        <Loader2 className="w-5 h-5 animate-spin mx-auto mt-4 text-[#2A9D8F]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* General error */}
      {errors.general && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-fadeInScale">
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
                : 'focus-visible:ring-[#2A9D8F]'
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
                : 'focus-visible:ring-[#2A9D8F]'
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
              : 'focus-visible:ring-[#2A9D8F]'
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
          <div className="w-5 h-5 rounded-md border-2 border-border peer-checked:border-[#2A9D8F] peer-checked:bg-[#2A9D8F] transition-colors flex items-center justify-center">
            {acceptTerms && <Check className="w-3 h-3 text-white" />}
          </div>
        </div>
        <span className="text-sm text-muted-foreground">
          Я погоджуюсь з{' '}
          <Link href="/pages/terms" className="text-[#2A9D8F] hover:underline">
            умовами використання
          </Link>{' '}
          та{' '}
          <Link href="/pages/privacy" className="text-[#2A9D8F] hover:underline">
            політикою конфіденційності
          </Link>
        </span>
      </label>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-full bg-gradient-to-r from-[#2A9D8F] to-[#3AA99B] hover:from-[#238B7E] hover:to-[#2A9D8F] text-white font-medium shadow-lg hover:shadow-xl transition-all mt-6"
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

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        Вже маєте акаунт?{' '}
        <Link
          href="/account/login"
          className="font-medium text-[#2A9D8F] hover:text-[#238B7E] transition-colors"
        >
          Увійти
        </Link>
      </p>
    </form>
  )
}
